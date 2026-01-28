# UX Review #4: Seller Profiles & Trust Building

**Review Date:** January 2025
**Status:** Complete
**Priority:** Critical (Trust = Transactions)

---

## Executive Summary

Trust is the currency of marketplaces. The seller profile and verification system directly impacts whether buyers complete transactions. While the platform has good foundational elements (verified badges, hero images, stats), there are significant gaps in social proof, rating visibility, and trust signal placement that could be costing conversions.

**Key Findings:**
1. **Rating not displayed on seller profile page** - SellerRatingSummary component exists but isn't used on `/sellers/[slug]`
2. **No reviews section on seller profile** - ListingReviewsSection exists but only used on listing pages
3. **Stats props exist but aren't utilized** - SellerInfoCard has stats props (totalSold, avgResponseTime) but page doesn't pass them
4. **Verification badge placement is good** but lacks progressive trust levels
5. **No transaction history or "Recently Sold" visibility** - sold items shown but not transaction count badges
6. **Missing response time tracking** - avgResponseTime prop exists but no data collection

---

## Current State Analysis

### Files Analyzed

| File | Purpose | Lines |
|------|---------|-------|
| [app/sellers/[slug]/page.tsx](../app/sellers/[slug]/page.tsx) | Public seller profile page | 386 |
| [components/listings/seller-info-card.tsx](../components/listings/seller-info-card.tsx) | Reusable seller card component | 225 |
| [components/reviews/seller-rating-summary.tsx](../components/reviews/seller-rating-summary.tsx) | Rating display with distribution | 106 |
| [components/reviews/listing-reviews-section.tsx](../components/reviews/listing-reviews-section.tsx) | Full reviews UI with CRUD | 211 |
| [components/seller/profile-form.tsx](../components/seller/profile-form.tsx) | Seller profile editing | 334 |
| [components/seller/verified-wizard.tsx](../components/seller/verified-wizard.tsx) | Verification application flow | 390 |
| [prisma/schema.prisma](../prisma/schema.prisma) | SellerProfile & Review models | - |

### Current Seller Profile Structure

```
/sellers/[slug]
├── Hero Section (with overlay gradient)
│   ├── Logo (64px rounded)
│   ├── Store Name + "Verifikovani prodavac" badge
│   ├── Short Description
│   ├── Location, Member Since, Active Listings, Sold Count (pills)
│   └── CTA: "Kontaktiraj prodavca"
├── Main Content (2/3 width)
│   ├── Active Listings Grid (3-col)
│   └── Recently Sold Section (6 items max)
└── Sidebar (1/3 width)
    ├── "O prodavnici" card
    ├── "Statistika" card (active, sold, member since, location)
    └── "Kontakt" card (email + CTA button)
```

### Trust Elements Present

| Element | Location | Status |
|---------|----------|--------|
| Verified Badge | Hero section | Present |
| ShieldCheck Icon | Gold color (#D4AF37) | Present |
| Member Since Date | Hero + Sidebar | Present |
| Location (City, Country) | Hero + Sidebar | Present |
| Active Listings Count | Hero + Sidebar | Present |
| Total Sold Count | Hero + Sidebar | Present |
| Store Description | Sidebar card | Present |
| Hero Image | Background | Optional |
| Logo | Hero section | Optional |

### Trust Elements MISSING

| Element | Status | Impact |
|---------|--------|--------|
| **Seller Rating/Stars** | NOT DISPLAYED | Critical |
| **Review Count** | NOT DISPLAYED | Critical |
| **Reviews Section** | NOT DISPLAYED | High |
| Response Time | Not tracked | Medium |
| Verification Date | Not shown | Low |
| Transaction Badges (10+, 50+, 100+) | Missing | Medium |
| Social Links Verification | Instagram only | Low |
| Return/Dispute Resolution Info | Missing | Medium |

---

## Critical Gap: Rating Not Displayed

### The Problem

The `SellerRatingSummary` component exists and works well, but it's **not used on the seller profile page**. The Review model stores ratings, but the seller profile page never fetches or displays them.

**Current seller profile page fetch:**
```typescript
// Only fetches profile data, no reviews/ratings
async function getSellerProfile(slug: string) {
  return prisma.sellerProfile.findUnique({
    where: { slug },
    select: {
      // ... profile fields only
      // NO reviews, NO rating aggregation
    },
  });
}
```

**What's needed:**
```typescript
// Should also fetch:
const reviews = await prisma.review.aggregate({
  where: { sellerId: profile.userId },
  _avg: { rating: true },
  _count: true,
});
```

### Impact

- 91% of consumers look at reviews before buying
- Missing ratings = missing the #1 trust signal
- Buyers must click through to individual listings to see any reviews
- Competitors (Chrono24, eBay) prominently display seller ratings

---

## Benchmark Comparison

### Chrono24 (Watch Marketplace)

| Feature | Chrono24 | PolovniSatovi |
|---------|----------|---------------|
| Seller Rating (stars) | Prominent, header | Not displayed |
| Review Count | Next to rating | Not displayed |
| Rating Distribution | Expandable | Component exists, unused |
| Response Time | "Usually replies in X" | Prop exists, no data |
| Transaction Count Badge | "500+ watches sold" | Just number |
| Verification Levels | Trusted Seller, Chrono24 Dealer | Single "Verified" |
| Reviews on Profile | Full section with pagination | Missing |
| Social Proof | "X buyers recommend" | Missing |

### eBay

| Feature | eBay | PolovniSatovi |
|---------|------|---------------|
| Feedback Score | Prominent number | Not displayed |
| Positive Feedback % | "99.2% positive" | Not displayed |
| Seller Level | Top Rated, etc. | Single level |
| Recent Feedback | Last 30 days breakdown | Missing |
| Member Since | Shown | Shown |
| Repeat Customer Rate | Shown for top sellers | Missing |

### Airbnb (Host Profiles)

| Feature | Airbnb | PolovniSatovi |
|---------|--------|---------------|
| Superhost Badge | Earned status | Missing equivalent |
| Response Rate | Percentage shown | Missing |
| Response Time | "within an hour" | Prop exists, unused |
| Reviews Count | Prominent | Missing |
| Verified Identity | Check marks | Single verified badge |
| Hosting Experience | "X years hosting" | "Član od" only |

---

## Prioritized Recommendations

### Critical Priority (Trust = Revenue)

#### CP1: Display Seller Rating on Profile
**Impact:** Critical | **Effort:** 2-3 hours

Add rating display to seller profile hero section and sidebar.

**Files:** [app/sellers/[slug]/page.tsx](../app/sellers/[slug]/page.tsx)

```typescript
// Add to getSellerProfile or create new function
async function getSellerRating(userId: string) {
  const result = await prisma.review.aggregate({
    where: { sellerId: userId },
    _avg: { rating: true },
    _count: true,
  });

  const distribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { sellerId: userId },
    _count: true,
  });

  return {
    averageRating: result._avg.rating || 0,
    totalReviews: result._count,
    distribution: Object.fromEntries(
      [1, 2, 3, 4, 5].map(r => [r, distribution.find(d => d.rating === r)?._count || 0])
    ),
  };
}
```

#### CP2: Add Reviews Section to Seller Profile
**Impact:** Critical | **Effort:** 3-4 hours

Reuse `ListingReviewsSection` component (or create `SellerReviewsSection`) on the seller profile page.

**Files:** [app/sellers/[slug]/page.tsx](../app/sellers/[slug]/page.tsx)

Add below the listings grid:
```tsx
<section className="mt-8">
  <SellerRatingSummary
    averageRating={rating.averageRating}
    totalReviews={rating.totalReviews}
    distribution={rating.distribution}
    showDistribution={true}
  />
  <ReviewList reviews={reviews} />
</section>
```

### High Priority

#### HP1: Add Transaction Count Badges
**Impact:** High | **Effort:** 2-3 hours

Show achievement badges based on transaction history:
- "10+ satova prodato"
- "50+ satova prodato"
- "100+ satova prodato"

**Implementation:**
```tsx
function TransactionBadge({ count }: { count: number }) {
  if (count >= 100) return <Badge className="bg-amber-500">100+ prodato</Badge>;
  if (count >= 50) return <Badge className="bg-amber-400">50+ prodato</Badge>;
  if (count >= 10) return <Badge className="bg-amber-300">10+ prodato</Badge>;
  return null;
}
```

#### HP2: Implement Response Time Tracking
**Impact:** High | **Effort:** 1 day

Track and display average response time:
1. Add `lastMessageAt` tracking in MessageThread
2. Calculate avg response time on message send
3. Display "Odgovara obično za X sati"

**Database change:**
```prisma
model MessageThread {
  // ... existing fields
  avgResponseTimeMinutes Int?
}
```

#### HP3: Add "Top Seller" Badge System
**Impact:** High | **Effort:** 2-3 days

Create tiered seller status like Airbnb Superhost:
- **Novi prodavac** - < 5 sales
- **Aktivan prodavac** - 5-19 sales
- **Pouzdani prodavac** - 20-49 sales, 4.5+ rating
- **Top prodavac** - 50+ sales, 4.8+ rating, < 2hr response

### Medium Priority

#### MP1: Show Verification Date
**Impact:** Medium | **Effort:** 30 min

Display when seller was verified: "Verifikovan od marta 2024"

#### MP2: Add Social Proof Banner
**Impact:** Medium | **Effort:** 2-3 hours

Show aggregate social proof:
```tsx
<div className="text-sm text-muted-foreground">
  <span className="font-semibold text-foreground">95%</span> kupaca preporučuje ovog prodavca
</div>
```

#### MP3: Improve Rating Visibility on Listing Cards
**Impact:** Medium | **Effort:** 2-3 hours

Add seller rating snippet to listing cards in grid view.

#### MP4: Add Return/Dispute Information
**Impact:** Medium | **Effort:** 2-3 hours

Show dispute resolution and return policy info on profile.

---

## Implementation Specifications

### Spec 1: Add Rating to Seller Profile (CP1)

**Current page.tsx structure:**
```typescript
export default async function SellerPublicProfilePage({ params }: SellerPageProps) {
  const profile = await getSellerProfile(slug);
  const listings = await getSellerListings(profile.user.id);
  // ... render
}
```

**Updated structure:**
```typescript
// Add new function
async function getSellerStats(userId: string) {
  const [ratingAgg, reviews] = await Promise.all([
    prisma.review.aggregate({
      where: { sellerId: userId },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.review.findMany({
      where: { sellerId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    averageRating: ratingAgg._avg.rating || 0,
    totalReviews: ratingAgg._count,
    recentReviews: reviews,
  };
}

export default async function SellerPublicProfilePage({ params }: SellerPageProps) {
  const profile = await getSellerProfile(slug);
  const [listings, stats] = await Promise.all([
    getSellerListings(profile.user.id),
    getSellerStats(profile.user.id),
  ]);
  // ... render with stats
}
```

**Hero section update:**
```tsx
// After the "Verifikovani prodavac" badge, add:
{stats.totalReviews > 0 && (
  <div className="flex items-center gap-2 mt-2">
    <RatingStars rating={stats.averageRating} size="sm" />
    <span className="text-white/80 text-sm">
      {stats.averageRating.toFixed(1)} ({stats.totalReviews} {stats.totalReviews === 1 ? "ocena" : "ocena"})
    </span>
  </div>
)}
```

---

### Spec 2: Add Reviews Section (CP2)

**Add to page.tsx, after the listings grid:**
```tsx
{/* Reviews Section */}
{stats.totalReviews > 0 && (
  <section className="space-y-6 pt-8 border-t">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Ocene i komentari</h2>
      <span className="text-sm text-muted-foreground">
        {stats.totalReviews} {stats.totalReviews === 1 ? "ocena" : "ocena"}
      </span>
    </div>

    <SellerRatingSummary
      averageRating={stats.averageRating}
      totalReviews={stats.totalReviews}
      distribution={stats.distribution}
      showDistribution={true}
    />

    <div className="space-y-4">
      {stats.recentReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>

    {stats.totalReviews > 10 && (
      <Button variant="outline" className="w-full">
        Prikaži sve ocene ({stats.totalReviews})
      </Button>
    )}
  </section>
)}
```

---

### Spec 3: Transaction Badge Component (HP1)

**New file: `components/seller/transaction-badge.tsx`**
```tsx
import { Badge } from "@/components/ui/badge";
import { Award, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionBadgeProps {
  soldCount: number;
  className?: string;
}

const TIERS = [
  { min: 100, label: "100+ prodato", icon: Trophy, color: "bg-amber-500 text-white" },
  { min: 50, label: "50+ prodato", icon: Medal, color: "bg-amber-400 text-amber-950" },
  { min: 10, label: "10+ prodato", icon: Award, color: "bg-amber-200 text-amber-900" },
] as const;

export function TransactionBadge({ soldCount, className }: TransactionBadgeProps) {
  const tier = TIERS.find(t => soldCount >= t.min);
  if (!tier) return null;

  const Icon = tier.icon;

  return (
    <Badge className={cn(tier.color, className)}>
      <Icon className="h-3 w-3 mr-1" aria-hidden />
      {tier.label}
    </Badge>
  );
}
```

---

### Spec 4: Seller Trust Score Component (HP3)

**New file: `components/seller/seller-trust-level.tsx`**
```tsx
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Star, Award, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellerTrustLevelProps {
  soldCount: number;
  averageRating: number;
  responseTimeHours?: number;
  className?: string;
}

type TrustLevel = "new" | "active" | "trusted" | "top";

function calculateTrustLevel(
  soldCount: number,
  averageRating: number,
  responseTimeHours?: number
): TrustLevel {
  if (soldCount >= 50 && averageRating >= 4.8 && (responseTimeHours ?? 24) <= 2) {
    return "top";
  }
  if (soldCount >= 20 && averageRating >= 4.5) {
    return "trusted";
  }
  if (soldCount >= 5) {
    return "active";
  }
  return "new";
}

const LEVEL_CONFIG = {
  new: {
    label: "Novi prodavac",
    icon: ShieldCheck,
    className: "bg-muted text-muted-foreground",
  },
  active: {
    label: "Aktivan prodavac",
    icon: Star,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  },
  trusted: {
    label: "Pouzdani prodavac",
    icon: Award,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  },
  top: {
    label: "Top prodavac",
    icon: Crown,
    className: "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
  },
} as const;

export function SellerTrustLevel({
  soldCount,
  averageRating,
  responseTimeHours,
  className,
}: SellerTrustLevelProps) {
  const level = calculateTrustLevel(soldCount, averageRating, responseTimeHours);
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="h-3.5 w-3.5 mr-1.5" aria-hidden />
      {config.label}
    </Badge>
  );
}
```

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Profile-to-contact rate | Unknown | +25% | Track "Kontaktiraj" clicks |
| Avg time on seller profile | Unknown | +40% | Analytics |
| Review submission rate | Unknown | +50% | Track review form opens |
| Trust signal visibility | 4/10 elements | 8/10 elements | Manual audit |
| Seller verification rate | Unknown | +20% | Track applications |

---

## Research Sources

- [Building Trust into UX - LogRocket](https://blog.logrocket.com/ux-design/trust-driven-ux-examples/)
- [Marketplace UX Design Best Practices](https://excited.agency/blog/marketplace-ux-design)
- [12 Best Trust Badges 2025](https://wisernotify.com/blog/best-trust-badges/)
- [Website Trust Signals 2025](https://www.slashexperts.com/post/website-trust-signals-the-hidden-elements-costing-you-sales)
- [The "Verified" Badge Psychology](https://www.jasminedirectory.com/blog/the-verified-badge-consumer-psychology-and-click-through-rates/)
- [Trust UX: Proof, Guarantees, and Signals](https://www.userintuition.ai/reference-guides/trust-ux-proof-guarantees-and-signals-that-reduce-risk)
- [Marketplace UI/UX Best Practices - Purrweb](https://www.purrweb.com/blog/marketplace-ux-ui-design/)

---

## Next Steps

1. **Immediate (Today):** Add rating fetch and display to seller profile page (CP1)
2. **This Week:** Add reviews section to seller profile (CP2)
3. **Next Sprint:** Implement transaction badges and trust levels (HP1, HP3)
4. **Backlog:** Response time tracking, social proof banners

---

*Review completed. Proceed to Review #5: Authentication & Onboarding*
