# Listing Page UX Improvements - Implementation Plan

Based on UX_REVIEW_02_LISTING_PAGE.md, implementing 6 improvements in 4 phases.

---

## Phase 1: Seller Stats + Rating in Contact Card (QW-1 + QW-2)

These share the same database queries, so they're implemented together.

### Step 1: Add parallel queries to `page.tsx`

**File:** `web/app/listing/[id]/page.tsx` (lines 145-160)

Replace the sequential `auth()` call and `isFavorited` query with a `Promise.all()` block:

```typescript
const [session, sellerListingCounts, sellerReviewData, favoritesCount] = await Promise.all([
  auth(),
  prisma.listing.groupBy({
    by: ['status'],
    where: { sellerId: listing.seller.id },
    _count: { id: true },
  }),
  prisma.review.aggregate({
    where: { sellerId: listing.seller.id },
    _avg: { rating: true },
    _count: { rating: true },
  }),
  prisma.favorite.count({ where: { listingId: id } }),
]);
```

Compute derived values:
```typescript
const activeListings = sellerListingCounts.find(s => s.status === 'APPROVED')?._count.id ?? 0;
const totalSold = sellerListingCounts.find(s => s.status === 'SOLD')?._count.id ?? 0;
const sellerRating = sellerReviewData._avg.rating ? Number(sellerReviewData._avg.rating) : null;
const sellerReviewCount = sellerReviewData._count.rating ?? 0;
const sellerStats = { activeListings, totalSold: totalSold > 0 ? totalSold : undefined };
```

The `isFavorited` check stays sequential (depends on `viewerId` from session).

### Step 2: Pass `stats` to both SellerInfoCard instances

**File:** `web/app/listing/[id]/page.tsx` (lines 355-360 and 395-400)

Add `stats={sellerStats}` prop to both `<SellerInfoCard>` invocations. The component already has full stats rendering code at lines 114-146 — it's dead code that gets activated by passing data.

### Step 3: Add seller rating to ListingContactCard

**File:** `web/components/listings/listing-contact-card.tsx`

- Add `sellerRating?: number | null` and `sellerReviewCount?: number` props
- Add `Star` to lucide-react imports
- Render rating display after the price/badge row, before trust badges (line 64):
  - Star icon (filled yellow), rating number, review count text in Serbian
  - Only renders when `sellerRating != null && sellerReviewCount > 0`

Then pass these props from `page.tsx` to both `<ListingContactCard>` instances.

---

## Phase 2: Favorites Count + Badge Tooltip (QW-3 + QW-4)

Independent of Phase 1, can be done in parallel.

### Step 4: Display favorites count near wishlist button

**File:** `web/app/listing/[id]/page.tsx` (lines 315-328)

The `favoritesCount` query is already added in Phase 1's `Promise.all()`. Add a text element before the ShareButton/WishlistButton group:

```tsx
{favoritesCount > 0 && (
  <span className="text-xs text-muted-foreground">
    {favoritesCount} {favoritesCount === 1 ? "korisnik prati" : "korisnika prati"}
  </span>
)}
```

No new component needed — just inline text.

### Step 5: Add tooltip to verified badge in SellerInfoCard

**File:** `web/components/listings/seller-info-card.tsx` (lines 94-107)

- Import Tooltip components from `@/components/ui/tooltip`
- Wrap the existing `<Badge>` in a `<TooltipProvider delayDuration={300}>` + `<Tooltip>` + `<TooltipTrigger asChild>` / `<TooltipContent>`
- Add `cursor-help` class to the Badge
- Tooltip content explains verification type in Serbian:
  - Verified: "Identitet prodavca je potvrđen KYC verifikacijom"
  - Authenticated: "Korisnik je prošao autentifikaciju identiteta"

---

## Phase 3: Gallery Verification Badge (ME-2)

### Step 6: Add verified badge overlay on gallery images

**File:** `web/components/listings/listing-image-gallery.tsx`

- Add `isVerifiedSeller?: boolean` prop
- Add `ShieldCheck` to lucide-react imports
- Insert badge overlay inside main image container, after image counter (line 221):
  - Position: `absolute top-3 left-3 z-20` (counter is at `top-3 right-3`, no overlap)
  - Style: gold background `bg-[#D4AF37]`, rounded-full, matching existing verified color
  - Text: "Verifikovan prodavac" on desktop, "Verifikovan" on mobile

Then pass `isVerifiedSeller={isVerifiedSeller}` from `page.tsx` (variable already exists at line 173).

---

## Phase 4: Similar Watches Section (ME-1)

### Step 7: Create SimilarListingsSection server component

**New file:** `web/components/listings/similar-listings-section.tsx`

Async server component that:
1. Queries listings with same brand OR within ±30% price range, status APPROVED, excluding current listing
2. Includes first photo and seller details (matching ListingSummary shape)
3. Returns `null` if no results (graceful degradation)
4. Renders `<ListingGrid listings={...} columns={4} />` under an "Slični satovi" heading
5. Follows the pattern from `recent-listings-section.tsx`

### Step 8: Integrate into listing page

**File:** `web/app/listing/[id]/page.tsx`

- Import `SimilarListingsSection`
- Add after the reviews section (line 370), wrapped in `<Suspense>` with skeleton fallback
- Placed in the left column (full-width below reviews, above the closing `</div>`)

---

## Files Changed Summary

| File | Type | Changes |
|------|------|---------|
| `web/app/listing/[id]/page.tsx` | Edit | Parallel queries, pass new props, favorites count display, Suspense + similar watches |
| `web/components/listings/listing-contact-card.tsx` | Edit | Add rating props + Star display |
| `web/components/listings/seller-info-card.tsx` | Edit | Wrap badge in Tooltip |
| `web/components/listings/listing-image-gallery.tsx` | Edit | Add verified badge overlay |
| `web/components/listings/similar-listings-section.tsx` | **New** | Server component for similar watches |

## Verification

After implementation, verify on a listing page:
1. Seller stats (active/sold) show in seller info card
2. Star rating appears below price when seller has reviews
3. "N korisnika prati" text appears when listing has favorites
4. Badge tooltip appears on hover (300ms delay)
5. Gold "Verifikovan" badge overlays gallery for verified sellers
6. "Slični satovi" section appears below reviews with relevant listings
