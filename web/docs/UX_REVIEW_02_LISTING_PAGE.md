# UX Review 2: Single Listing Page (PDP)

**Date:** January 28, 2026
**Reviewer:** Claude (AI-assisted UX analysis)
**Focus:** Image gallery, specs display, pricing, CTA placement, seller info, trust signals, reviews

---

## Executive Summary

The PolovniSatovi listing detail page has a solid foundation with good components: lens zoom on desktop, sticky mobile CTA, seller badges, trust badges, and a well-organized specs accordion. However, several high-impact UX gaps exist when compared to Chrono24, Airbnb, and eBay patterns. Key opportunities include adding seller statistics, improving review prominence, strengthening authentication visibility, and adding social proof indicators.

---

## Part 1: Current State Analysis

### Page Structure (Desktop)
```
┌─────────────────────────────────────────────────────┐
│ Breadcrumbs                                         │
├─────────────────────────┬───────────────────────────┤
│                         │ Contact Card (Sticky)     │
│   Image Gallery         │ - Price                   │
│   (with lens zoom)      │ - Seller Badge           │
│                         │ - Trust Badges           │
│                         │ - Contact Form           │
├─────────────────────────┤ - Buyer Protection       │
│ Title + Share/Wishlist  │                          │
├─────────────────────────┤ Seller Info Card         │
│ Brand / Model / Ref     │ - Avatar                 │
├─────────────────────────┤ - Name / Badge           │
│ Specs Accordion         │ - Member Since           │
│ - Identification        │ - Profile Link           │
│ - Case                  │                          │
│ - Movement              │                          │
│ - Dial & Bezel          │                          │
│ - Strap                 │                          │
├─────────────────────────┤                          │
│ Condition & Docs        │                          │
├─────────────────────────┴───────────────────────────┤
│ Description                                         │
├─────────────────────────────────────────────────────┤
│ Reviews Section                                     │
└─────────────────────────────────────────────────────┘
```

### Page Structure (Mobile)
```
┌─────────────────────────┐
│ Breadcrumbs             │
├─────────────────────────┤
│ Image Gallery           │
│ (swipe + dots)          │
├─────────────────────────┤
│ Contact Card            │
│ (full width)            │
├─────────────────────────┤
│ Title + Share/Wishlist  │
├─────────────────────────┤
│ Specs Accordion         │
├─────────────────────────┤
│ Description             │
├─────────────────────────┤
│ Seller Info Card        │
├─────────────────────────┤
│ Reviews Section         │
├─────────────────────────┤
│ STICKY CTA BAR          │
│ Price | Share | Contact │
└─────────────────────────┘
```

### Strengths Identified

| Component | Strength |
|-----------|----------|
| **Image Gallery** | Desktop lens zoom (2x-3x), lightbox modal, keyboard nav, swipe on mobile |
| **Sticky CTA** | Mobile sticky bar with price, share, contact button |
| **Trust Badges** | "Zaštita kupca", "Sigurna poruka", "Proveren oglas" |
| **Seller Badges** | "Verifikovani prodavac" / "Autentifikovani korisnik" differentiation |
| **Specs Accordion** | Well-organized collapsible sections with Serbian labels |
| **Condition Display** | Visual grade display with color coding |
| **Buyer Protection** | Expandable explanation with safety tips |
| **Structured Data** | Schema.org Product markup for SEO |
| **Responsive Design** | Different layouts for mobile/desktop |
| **Owner View** | Clear messaging when viewing own listing |

### Current Components

| Component | File | Purpose |
|-----------|------|---------|
| Main Page | [app/listing/[id]/page.tsx](../app/listing/[id]/page.tsx) | Server component, data fetching |
| Image Gallery | [listing-image-gallery.tsx](../components/listings/listing-image-gallery.tsx) | Photos with zoom/lightbox |
| Contact Card | [listing-contact-card.tsx](../components/listings/listing-contact-card.tsx) | Price, CTA, trust badges |
| Specs Accordion | [listing-specs-accordion.tsx](../components/listings/listing-specs-accordion.tsx) | Watch specifications |
| Seller Info | [seller-info-card.tsx](../components/listings/seller-info-card.tsx) | Seller details |
| Sticky CTA | [listing-sticky-cta.tsx](../components/listings/listing-sticky-cta.tsx) | Mobile bottom bar |
| Trust Badges | [trust-badges.tsx](../components/listings/trust-badges.tsx) | Trust indicators |
| Buyer Protection | [buyer-protection-info.tsx](../components/listings/buyer-protection-info.tsx) | Protection explainer |
| Reviews | [listing-reviews-section.tsx](../components/reviews/listing-reviews-section.tsx) | Reviews & ratings |

---

## Part 2: Benchmark Comparison

### Chrono24 PDP Patterns

| Feature | Chrono24 | PolovniSatovi | Gap |
|---------|----------|---------------|-----|
| Certified badge on images | Blue "C" overlay on photo | No badge on gallery | **High** |
| Authentication certificate | Digital certificate link | Not available | **Medium** |
| Seller statistics | "X watches sold", response time | Stats props exist but not populated | **High** |
| Price transparency | Price history, market comparison | Single price only | Low |
| Similar watches section | "You might also like" | Not implemented | **Medium** |
| Dealer verification badge | "Trusted Seller" badge | Has badges but less prominent | **Medium** |
| Photo requirements | Minimum photo standards | No validation shown | Low |

**Key Stat:** Items with Chrono24 "Certified" badge are viewed **20% more** and have **7% higher sales**.

### Airbnb Listing Patterns

| Feature | Airbnb | PolovniSatovi | Gap |
|---------|--------|---------------|-----|
| Always-visible booking/CTA | Sticky sidebar follows scroll | Desktop sidebar sticky, mobile bar | OK |
| Host response time | "Usually responds within 1 hour" | Props exist, not populated | **High** |
| Photo gallery grid | Multi-image preview grid | Single image + thumbnails | **Medium** |
| Reviews above fold | Rating + count in header | Reviews at bottom only | **Medium** |
| "Home highlights" | ML-generated insights | Not available | Low |
| Superhost badge | Prominent badge with explanation | Badge exists, less explanation | **Medium** |
| Cancellation policy | Clear policy display | Not applicable | N/A |

**Key Stat:** Listings with more details get up to **20% more bookings** on Airbnb.

### eBay Item Page Patterns

| Feature | eBay | PolovniSatovi | Gap |
|---------|------|---------------|-----|
| Seller feedback score | "99.8% positive (1,234 reviews)" | Rating shown but not prominent | **Medium** |
| Items sold count | "5,432 sold" | Not shown | **Medium** |
| Watchers count | "23 watching" | Favorites exist but count hidden | **Medium** |
| Authenticity guarantee | Bold guarantee messaging | Trust badges present | OK |
| Returns policy | Clear return info | Implied in buyer protection | Low |
| Price comparison | "X% below retail" | Not available | Low |

### Baymard Institute Best Practices (2025)

| Practice | Current State | Recommendation |
|----------|---------------|----------------|
| Multiple product views | Good - gallery with zoom | Add 360° if possible |
| Buyer-generated visuals | Not available | Consider allowing buyer photos in reviews |
| Spec table above fold | Collapsed by default | Keep first section expanded (already done) |
| Social proof near CTA | Trust badges present | Add seller rating near price |
| Sticky CTA on mobile | Implemented | Keep |
| Related products | Not implemented | Add similar watches section |

---

## Part 3: Gap Analysis

### Critical Gaps (High Impact)

#### 1. Seller Statistics Not Populated
**Current:** `SellerInfoCard` accepts `stats` prop with `activeListings`, `totalSold`, `avgResponseTime` but **page never passes these values**
**Impact:** Buyers can't assess seller activity/reliability
**Benchmark:** Chrono24 shows "X watches sold", Airbnb shows response time

**File:** [app/listing/[id]/page.tsx:395-400](../app/listing/[id]/page.tsx#L395-L400)
```tsx
// Current - stats prop not passed
<SellerInfoCard
  seller={sellerDetails}
  locationLabel={sellerLocation}
  memberSince={memberSince}
  badge={sellerBadge}
  // Missing: stats={{ activeListings, totalSold, avgResponseTime }}
/>
```

#### 2. Rating/Reviews Not Visible Above Fold
**Current:** Reviews section at very bottom of page
**Impact:** Primary trust signal hidden, requires scrolling
**Benchmark:** Airbnb shows rating in header; eBay shows feedback score prominently

#### 3. No Authentication Badge on Gallery Images
**Current:** Seller badge only in contact card, not on photos
**Impact:** Photos are main visual; trust signal missed
**Benchmark:** Chrono24 overlays "C" certified badge on listing images

#### 4. No Social Proof Indicators
**Current:** No "X people viewing", "Y favorites", "Z sold by this seller"
**Impact:** No urgency or popularity signals
**Benchmark:** Airbnb "X people looking", eBay "Y watchers"

### Medium Gaps

#### 5. Gallery Could Use Multi-Image Preview
**Current:** Single main image with thumbnail strip
**Impact:** Takes more clicks to see all photos
**Benchmark:** Airbnb shows 5-image grid preview

#### 6. No "Similar Watches" Section
**Current:** User sees only current listing
**Impact:** Missed cross-sell opportunity, harder to compare
**Benchmark:** All major marketplaces show related items

#### 7. Seller Badge Explanation Missing
**Current:** Badge shows "Verifikovani prodavac" but no explanation
**Impact:** Users may not understand value of verification
**Benchmark:** Airbnb Superhost has "Learn more" with criteria

#### 8. Contact Form Below Fold on Mobile
**Current:** Full contact card below gallery on mobile
**Impact:** Extra scroll to primary action
**Benchmark:** Consider inline "Kontaktiraj" in sticky bar that opens sheet

### Lower Priority Gaps

#### 9. No Condition Photo Guidelines
**Current:** Photos accepted as-is
**Impact:** Photo quality varies

#### 10. No Price Comparison / Market Data
**Current:** Single price displayed
**Impact:** No context for price fairness

---

## Part 4: Prioritized Recommendations

### Quick Wins (< 1 day effort)

#### QW-1: Add Seller Rating Near Price
**Effort:** 2 hours
**Impact:** High (trust at decision point)
**Files:** [listing-contact-card.tsx](../components/listings/listing-contact-card.tsx)
**Change:** Display seller's average rating and review count next to price

```tsx
// In CardHeader, after price
{sellerRating && (
  <div className="flex items-center gap-1.5 mt-1">
    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    <span className="font-semibold">{sellerRating.toFixed(1)}</span>
    <span className="text-muted-foreground text-sm">
      ({reviewCount} ocena)
    </span>
  </div>
)}
```

#### QW-2: Populate Seller Statistics
**Effort:** 3-4 hours (DB query + passing props)
**Impact:** High (credibility indicator)
**Files:** [app/listing/[id]/page.tsx](../app/listing/[id]/page.tsx)
**Change:** Query seller's listing count, sold count, pass to SellerInfoCard

**Add to page query:**
```tsx
const sellerStats = await prisma.listing.groupBy({
  by: ['status'],
  where: { sellerId: listing.seller.id },
  _count: { id: true },
});
const activeListings = sellerStats.find(s => s.status === 'APPROVED')?._count.id ?? 0;
const totalSold = sellerStats.find(s => s.status === 'SOLD')?._count.id ?? 0;
```

#### QW-3: Add Favorites Count Display
**Effort:** 2 hours
**Impact:** Medium (social proof)
**Files:** Page query + wishlist button area
**Change:** Show "X korisnika prati ovaj oglas" near wishlist button

**Query:**
```tsx
const favoritesCount = await prisma.favorite.count({
  where: { listingId: id }
});
```

#### QW-4: Add Verified Badge Tooltip
**Effort:** 1 hour
**Impact:** Medium (education)
**Files:** [seller-info-card.tsx](../components/listings/seller-info-card.tsx)
**Change:** Wrap badge in tooltip explaining verification benefits

### Medium Effort (1-3 days)

#### ME-1: Add Similar Watches Section
**Effort:** 1 day
**Impact:** High (engagement, comparison)
**Files:** New component + page integration
**Change:** Query listings with same brand or price range, display 4-6 cards

```tsx
const similarListings = await prisma.listing.findMany({
  where: {
    OR: [
      { brand: listing.brand },
      {
        priceEurCents: {
          gte: listing.priceEurCents * 0.7,
          lte: listing.priceEurCents * 1.3
        }
      }
    ],
    status: 'APPROVED',
    id: { not: listing.id }
  },
  take: 6,
  orderBy: { createdAt: 'desc' }
});
```

#### ME-2: Overlay Verification Badge on Gallery
**Effort:** 4-6 hours
**Impact:** High (trust at first glance)
**Files:** [listing-image-gallery.tsx](../components/listings/listing-image-gallery.tsx)
**Change:** Add conditional badge overlay on main image for verified sellers

```tsx
{isVerifiedSeller && (
  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-lg">
    <ShieldCheck className="h-3.5 w-3.5" />
    Verifikovan
  </div>
)}
```

#### ME-3: Multi-Image Grid Preview
**Effort:** 1 day
**Impact:** Medium (visual appeal)
**Files:** [listing-image-gallery.tsx](../components/listings/listing-image-gallery.tsx)
**Change:** Desktop: Show 2x2 or 1+4 grid preview instead of single image

**Layout concept:**
```
┌────────────────┬────────┐
│                │  img2  │
│    main img    ├────────┤
│                │  img3  │
├────────┬───────┼────────┤
│  img4  │ img5  │ +X more│
└────────┴───────┴────────┘
```

#### ME-4: Add Social Proof Banner
**Effort:** 4 hours
**Impact:** Medium (urgency)
**Files:** New component
**Change:** Show "X korisnika gleda ovaj oglas" with periodic updates

### Major Changes (3+ days)

#### MC-1: Reviews Summary in Header
**Effort:** 3 days
**Impact:** High (trust above fold)
**Change:** Move rating summary near title, keep full reviews at bottom

```tsx
// Near title
<div className="flex items-center gap-2 text-sm">
  <div className="flex items-center gap-1">
    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    <span className="font-semibold">{rating}</span>
  </div>
  <span className="text-muted-foreground">•</span>
  <button
    onClick={scrollToReviews}
    className="text-primary hover:underline"
  >
    {reviewCount} ocena
  </button>
</div>
```

#### MC-2: Contact Sheet on Mobile
**Effort:** 3 days
**Impact:** Medium (faster action)
**Change:** "Kontaktiraj" button in sticky bar opens bottom sheet with contact form

#### MC-3: Price History / Market Comparison
**Effort:** 1-2 weeks
**Impact:** Medium (transparency, StockX-style)
**Change:** Track price changes, show average market price for model

---

## Part 5: Implementation Specifications

### QW-1: Add Seller Rating Near Price

**File:** `web/components/listings/listing-contact-card.tsx`

**Add new props:**
```tsx
interface ListingContactCardProps {
  // ... existing props
  sellerRating?: number | null;
  sellerReviewCount?: number;
}
```

**Add in CardHeader (after price, before trust badges):**
```tsx
{sellerRating !== null && sellerRating !== undefined && (
  <div className="flex items-center gap-1.5 mt-2">
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= Math.round(sellerRating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
    <span className="text-sm font-medium">{sellerRating.toFixed(1)}</span>
    <span className="text-xs text-muted-foreground">
      ({sellerReviewCount} {sellerReviewCount === 1 ? 'ocena' : 'ocena'})
    </span>
  </div>
)}
```

**Update page.tsx to fetch and pass rating:**
```tsx
// Add to imports
import { prisma } from "@/lib/prisma";

// In page function, after fetching listing
const sellerReviews = await prisma.review.aggregate({
  where: { sellerId: listing.seller.id },
  _avg: { rating: true },
  _count: { rating: true },
});

// Pass to ListingContactCard
<ListingContactCard
  // ... existing props
  sellerRating={sellerReviews._avg.rating}
  sellerReviewCount={sellerReviews._count.rating}
/>
```

### QW-2: Populate Seller Statistics

**File:** `web/app/listing/[id]/page.tsx`

**Add after line ~145 (after fetching listing):**
```tsx
// Fetch seller statistics
const [sellerListingCounts, sellerReviewStats] = await Promise.all([
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
]);

const activeListings = sellerListingCounts.find(s => s.status === 'APPROVED')?._count.id ?? 0;
const totalSold = sellerListingCounts.find(s => s.status === 'SOLD')?._count.id ?? 0;

const sellerStats = {
  activeListings,
  totalSold: totalSold > 0 ? totalSold : undefined,
};
```

**Update SellerInfoCard calls (lines ~355 and ~395):**
```tsx
<SellerInfoCard
  seller={sellerDetails}
  locationLabel={sellerLocation}
  memberSince={memberSince}
  badge={sellerBadge}
  stats={sellerStats}
  showStats={true}
/>
```

### ME-2: Verification Badge on Gallery

**File:** `web/components/listings/listing-image-gallery.tsx`

**Add prop:**
```tsx
interface ListingImageGalleryProps {
  photos: ListingPhoto[];
  title: string;
  isVerifiedSeller?: boolean;
}
```

**Add badge inside main image container (after image counter, line ~218):**
```tsx
{/* Verified Seller Badge */}
{isVerifiedSeller && (
  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-neutral-900 shadow-lg">
    <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
    <span className="hidden sm:inline">Verifikovan prodavac</span>
    <span className="sm:hidden">Verifikovan</span>
  </div>
)}
```

**Update page.tsx to pass prop:**
```tsx
<ListingImageGallery
  photos={listing.photos}
  title={listing.title}
  isVerifiedSeller={isVerifiedSeller}
/>
```

---

## Part 6: Success Metrics

### Key Performance Indicators

| Metric | Current Baseline | Target | Measurement |
|--------|-----------------|--------|-------------|
| Listing → Contact rate | Measure | +20% | Analytics |
| Time to first contact click | Measure | -15% | Analytics |
| Gallery interaction rate | Measure | +10% | Analytics |
| Reviews section view rate | Measure | +30% | Scroll tracking |
| Bounce rate | Measure | -15% | Analytics |

### A/B Testing Suggestions

1. **Test QW-1**: Rating near price vs. rating only in reviews
2. **Test ME-2**: With gallery badge vs. without
3. **Test ME-1**: With similar watches vs. without

---

## Part 7: Verification Plan

### Manual Testing Checklist

- [ ] Seller rating displays correctly next to price
- [ ] Seller stats (active listings, sold) show in seller card
- [ ] Verification badge appears on gallery for verified sellers
- [ ] Favorites count displays correctly
- [ ] Similar watches section shows relevant items
- [ ] All trust badges render with tooltips
- [ ] Mobile sticky CTA works correctly
- [ ] Gallery zoom/lightbox functions on all browsers
- [ ] Reviews load and display correctly

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility Testing
- [ ] All images have alt text
- [ ] Keyboard navigation works in gallery
- [ ] Focus states visible
- [ ] Screen reader announces seller rating

---

## References

### Research Sources
- [Product Page UX Best Practices 2025 - Baymard Institute](https://baymard.com/blog/current-state-ecommerce-product-page-ux)
- [UX Guidelines for Ecommerce Product Pages - NN/G](https://www.nngroup.com/articles/ecommerce-product-pages/)
- [Chrono24 Certified Program](https://update.chrono24.com/chrono24s-certified-program-an-authenticity-verification-service/)
- [Airbnb UX Case Study](https://medium.com/@vishal.peshne/ux-case-study-the-success-of-airbnbs-user-centered-approach-7557f3d769b9)
- [The New Trusted Seller Badge - Chrono24](https://update.chrono24.com/trusted-seller-badge/)

### Key Statistics
- **51% of ecommerce sites** have mediocre or worse PDP UX (Baymard 2025)
- **67% of sites** lack buyer-generated visuals
- Chrono24 Certified items viewed **20% more often**
- Certified items have **7% higher sales**
- Listings with more details get **20% more bookings** (Airbnb)
- Peepers Eyewear saw **30% conversion lift** from better product photos

---

## Next Steps

1. Implement Quick Wins (QW-1 through QW-4)
2. Measure baseline metrics
3. Prioritize ME-1 (Similar Watches) for engagement
4. Consider ME-2 (Gallery Badge) for trust differentiation

---

*Review 3 will cover: Listing Discovery & Browse*
