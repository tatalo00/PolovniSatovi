# UX Review #3: Listing Discovery & Browse

**Review Date:** January 2025
**Status:** Complete
**Priority:** High (Core user flow)

---

## Executive Summary

The listing discovery experience is the primary way users find watches on the platform. While the current implementation has solid fundamentals (faceted search, mobile drawer, URL-based state), there are significant opportunities to improve filter UX, result feedback, and conversion optimization based on marketplace best practices.

**Key Findings:**
1. No result count feedback when applying filters (users don't know impact until after applying)
2. Price range inputs use manual text entry instead of range sliders
3. No saved searches or filter persistence
4. Missing "sort by relevance" and "newest" sort options
5. Filter count indicator exists on mobile but not prominent enough
6. No visual filters (e.g., condition color coding, brand logos)
7. Empty state is good but could guide users better

---

## Current State Analysis

### Files Analyzed

| File | Purpose | Lines |
|------|---------|-------|
| [app/listings/page.tsx](../app/listings/page.tsx) | Main page, server data fetching | ~100 |
| [components/listings/listing-filters.tsx](../components/listings/listing-filters.tsx) | Filter sidebar with all facets | 871 |
| [components/listings/listing-content.tsx](../components/listings/listing-content.tsx) | Results grid wrapper with sorting | ~150 |
| [components/listings/listing-grid.tsx](../components/listings/listing-grid.tsx) | Memoized listing cards grid | ~200 |
| [components/listings/mobile-filter-drawer.tsx](../components/listings/mobile-filter-drawer.tsx) | Bottom sheet for mobile filters | ~100 |
| [components/listings/active-filters.tsx](../components/listings/active-filters.tsx) | Filter badges with remove action | ~100 |

### Current Filter Structure

```
Desktop: 3-column layout
├── Sidebar (1 col): All filters in vertical scroll
├── Content (2 col): Results grid + pagination
└── Mobile: FAB button → Bottom sheet drawer
```

**Available Filters:**
1. Brand (multi-select with search, API suggestions)
2. Condition (multi-select: NEW, LIKE_NEW, VERY_GOOD, GOOD, FAIR)
3. Movement Type (multi-select: AUTOMATIC, MANUAL, QUARTZ)
4. Gender (multi-select: MENS, WOMENS, UNISEX)
5. Extras (multi-select: HAS_BOX, HAS_PAPERS, HAS_BOTH)
6. Price Range (min/max EUR text inputs)
7. Year Range (min/max year text inputs)
8. Location (text input)
9. Verified Seller (toggle)
10. Authenticated User (toggle)

**Sort Options:**
- Price: Low to High
- Price: High to Low
- Year: Newest First
- Year: Oldest First
- *(Missing: Relevance, Recently Listed)*

### Strengths Identified

1. **URL-based state management** - Filters persist in URL, shareable
2. **Dirty state tracking** - Apply button only enabled when filters changed
3. **Mobile drawer pattern** - Sheet component with proper height (90vh)
4. **Memoized grid cards** - Performance optimization with React.memo
5. **Active filters display** - Removable badges show current filters
6. **Brand search with API** - Autocomplete suggestions for brands
7. **Touch-friendly FAB** - 44px minimum touch target on mobile

### Issues Identified

#### Critical UX Gaps

1. **No result count feedback during filter selection**
   - Users must apply filters blindly, then see results
   - Best practice: Show "(X results)" next to each filter option
   - Industry standard: 10% higher conversion with count indicators

2. **Manual price input instead of visual slider**
   - Text inputs require knowing price ranges
   - No guidance on typical price ranges for watches
   - Airbnb uses dual-handle sliders with histogram

3. **No "Recently Listed" or "Relevance" sort**
   - Users can't find newest listings easily
   - No relevance scoring for search queries

4. **Apply button friction on desktop**
   - Requires explicit click to apply filters
   - Modern pattern: Auto-apply with debounce (200ms)
   - Current: Must click "Primeni filtere" every time

#### Medium Priority Gaps

5. **No saved searches**
   - Users can't save filter combinations
   - No email alerts for new matches

6. **Filter organization could be improved**
   - All filters visible at once (no progressive disclosure)
   - Most-used filters not prioritized at top

7. **No visual indicators for conditions**
   - Text-only condition labels
   - Could use color coding or icons

8. **Mobile filter count badge is subtle**
   - Small badge on FAB button
   - Could be more prominent with animation

#### Minor Gaps

9. **No filter presets/quick filters**
   - E.g., "Under €1,000", "With Box & Papers", "Luxury Brands"

10. **Year filter lacks common shortcuts**
    - No "Last 5 years", "Vintage (pre-2000)" options

---

## Benchmark Comparison

### Chrono24 (Watch Marketplace)

| Feature | Chrono24 | PolovniSatovi |
|---------|----------|---------------|
| Result counts per filter | Yes | No |
| Price histogram slider | Yes | No (text inputs) |
| Brand popularity sorting | Yes | No |
| Saved searches | Yes | No |
| Recently viewed | Yes | No |
| Map view | Yes | No |
| Certification filter | Yes | Yes (verified toggle) |

### Airbnb (General Marketplace)

| Feature | Airbnb | PolovniSatovi |
|---------|--------|---------------|
| Full-screen mobile overlay | Yes | Yes (90vh) |
| Price range slider | Dual-handle | Text inputs |
| Filter result preview | Yes | No |
| Clear button visibility | Progressive | Always visible |
| Animation feedback | Smooth | Basic |
| Auto-apply filters | Yes (with delay) | No (manual) |

### eBay (E-commerce)

| Feature | eBay | PolovniSatovi |
|---------|------|---------------|
| Left sidebar filters | Yes | Yes |
| Facet counts | Yes | No |
| Sort by "Best Match" | Yes | No |
| Sort by "Newly Listed" | Yes | No |
| Condition icons | Yes | No |
| Price brackets | Yes | No |

---

## Prioritized Recommendations

### Quick Wins (< 1 day each)

#### QW1: Add "Recently Listed" Sort Option
**Impact:** High | **Effort:** 1 hour

```typescript
// In listing-content.tsx, add to SORT_OPTIONS:
{ value: "createdAt_desc", label: "Najnoviji oglasi" },
{ value: "createdAt_asc", label: "Najstariji oglasi" },
```

**Files:** [listing-content.tsx:23-30](../components/listings/listing-content.tsx#L23-30), [lib/listings.ts](../lib/listings.ts)

#### QW2: Add Price Range Presets
**Impact:** Medium | **Effort:** 2-3 hours

Add quick-select buttons above price inputs:
- "Do €500"
- "€500 - €1.000"
- "€1.000 - €5.000"
- "Preko €5.000"

**Files:** [listing-filters.tsx:400-450](../components/listings/listing-filters.tsx#L400-450)

#### QW3: Improve Mobile Filter Badge Visibility
**Impact:** Medium | **Effort:** 1 hour

- Increase badge size from default to 20px
- Add pulse animation when filters are active
- Use brand gold color (#D4AF37) for badge

**Files:** [mobile-filter-drawer.tsx:45-60](../components/listings/mobile-filter-drawer.tsx#L45-60)

#### QW4: Add Condition Color Coding
**Impact:** Low | **Effort:** 2 hours

Color-code condition badges in filter dropdown:
- NEW: Green
- LIKE_NEW: Blue
- VERY_GOOD: Teal
- GOOD: Yellow
- FAIR: Orange

**Files:** [listing-filters.tsx:200-250](../components/listings/listing-filters.tsx#L200-250)

### Medium Effort (1-3 days)

#### ME1: Real-Time Filter Count Preview
**Impact:** High | **Effort:** 2-3 days

Show result count for each filter option:
```
☐ Rolex (42)
☐ Omega (28)
☐ Seiko (156)
```

**Implementation:**
1. Create API endpoint `/api/listings/facets` that returns counts
2. Fetch facet counts on filter panel open
3. Update counts when filters change
4. Show "(0)" options grayed out

**Files:** New API route, [listing-filters.tsx](../components/listings/listing-filters.tsx)

#### ME2: Price Range Slider Component
**Impact:** High | **Effort:** 2 days

Replace text inputs with dual-handle range slider:
- Min: €0, Max: €50,000+
- Show price distribution histogram
- Snap to €100 increments below €1,000
- Snap to €500 increments above €1,000

**Files:** New component `price-range-slider.tsx`, [listing-filters.tsx](../components/listings/listing-filters.tsx)

#### ME3: Auto-Apply Filters with Debounce (Desktop)
**Impact:** Medium | **Effort:** 1-2 days

Remove "Apply" button friction on desktop:
- Add 300ms debounce after filter change
- Show loading indicator during debounce
- Keep explicit apply for mobile (better for touch)

**Files:** [listing-filters.tsx](../components/listings/listing-filters.tsx)

#### ME4: Improved Empty State with Suggestions
**Impact:** Medium | **Effort:** 1 day

When no results:
- Suggest removing specific filters
- Show closest matching listings
- Offer to notify when matches appear

**Files:** [listing-grid.tsx:180-220](../components/listings/listing-grid.tsx#L180-220)

### Major Improvements (3+ days)

#### MJ1: Saved Searches Feature
**Impact:** High | **Effort:** 1 week

Allow users to:
- Save current filter combination
- Name their saved searches
- Receive email alerts for new matches
- View saved searches in dashboard

**Database:** New `SavedSearch` model
**Files:** New API routes, dashboard page, email templates

#### MJ2: Search Results Relevance Scoring
**Impact:** High | **Effort:** 1 week

Implement relevance-based sorting:
- Text match scoring in title/description
- Seller reputation weighting
- Listing completeness (photos, specs)
- Recency factor

**Files:** [lib/listings.ts](../lib/listings.ts), search algorithm

#### MJ3: Filter Analytics & Personalization
**Impact:** Medium | **Effort:** 1 week

Track filter usage to:
- Prioritize popular filters at top
- Show personalized filter presets
- A/B test filter layouts

**Files:** Analytics integration, filter component

---

## Implementation Specifications

### Spec 1: Add "Recently Listed" Sort (QW1)

**Current state in listing-content.tsx:**
```typescript
const SORT_OPTIONS = [
  { value: "price_asc", label: "Cena: Niža prvo" },
  { value: "price_desc", label: "Cena: Viša prvo" },
  { value: "year_desc", label: "Godina: Noviji prvo" },
  { value: "year_asc", label: "Godina: Stariji prvo" },
];
```

**New state:**
```typescript
const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Najnoviji oglasi" }, // NEW - default
  { value: "price_asc", label: "Cena: Niža prvo" },
  { value: "price_desc", label: "Cena: Viša prvo" },
  { value: "year_desc", label: "Godina: Noviji prvo" },
  { value: "year_asc", label: "Godina: Stariji prvo" },
];
```

**Also update lib/listings.ts** to handle `createdAt_desc` and `createdAt_asc` sort values in the `getListings` function orderBy clause.

---

### Spec 2: Price Range Presets (QW2)

**Add to listing-filters.tsx before price inputs:**
```tsx
const PRICE_PRESETS = [
  { label: "Do €500", min: 0, max: 500 },
  { label: "€500 - €1.000", min: 500, max: 1000 },
  { label: "€1.000 - €5.000", min: 1000, max: 5000 },
  { label: "Preko €5.000", min: 5000, max: null },
];

// In JSX, before price inputs:
<div className="flex flex-wrap gap-1.5 mb-3">
  {PRICE_PRESETS.map((preset) => (
    <Button
      key={preset.label}
      variant="outline"
      size="sm"
      className={cn(
        "h-7 text-xs",
        priceMin === preset.min && priceMax === preset.max && "bg-primary/10 border-primary"
      )}
      onClick={() => {
        setPriceMin(preset.min?.toString() || "");
        setPriceMax(preset.max?.toString() || "");
      }}
    >
      {preset.label}
    </Button>
  ))}
</div>
```

---

### Spec 3: Mobile Badge Animation (QW3)

**In mobile-filter-drawer.tsx, update badge styling:**
```tsx
{filterCount > 0 && (
  <Badge
    className={cn(
      "absolute -right-1 -top-1 h-5 w-5 rounded-full p-0",
      "flex items-center justify-center text-[10px]",
      "bg-[#D4AF37] text-white border-2 border-background",
      "animate-pulse" // Add pulse animation
    )}
  >
    {filterCount > 9 ? "9+" : filterCount}
  </Badge>
)}
```

---

### Spec 4: Facet Count API (ME1)

**New API route: `/api/listings/facets/route.ts`**
```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCache, CACHE_CONTROL } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Build base where clause from current filters
  const baseWhere = buildWhereClause(searchParams);

  // Get counts for each facet
  const [brandCounts, conditionCounts, movementCounts] = await Promise.all([
    prisma.listing.groupBy({
      by: ['brand'],
      where: { ...baseWhere, status: 'APPROVED' },
      _count: true,
    }),
    prisma.listing.groupBy({
      by: ['condition'],
      where: { ...baseWhere, status: 'APPROVED' },
      _count: true,
    }),
    prisma.listing.groupBy({
      by: ['movementType'],
      where: { ...baseWhere, status: 'APPROVED' },
      _count: true,
    }),
  ]);

  return jsonWithCache({
    brands: brandCounts.reduce((acc, b) => ({ ...acc, [b.brand]: b._count }), {}),
    conditions: conditionCounts.reduce((acc, c) => ({ ...acc, [c.condition]: c._count }), {}),
    movements: movementCounts.reduce((acc, m) => ({ ...acc, [m.movementType]: m._count }), {}),
  }, { cache: CACHE_CONTROL.SHORT });
}
```

---

### Spec 5: Price Range Slider Component (ME2)

**New component: `components/listings/price-range-slider.tsx`**
```tsx
"use client";

import { useState, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  histogram?: number[]; // Optional distribution data
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 100,
  formatValue = (v) => `€${v.toLocaleString()}`,
  histogram,
}: PriceRangeSliderProps) {
  return (
    <div className="space-y-4">
      {/* Histogram visualization */}
      {histogram && (
        <div className="flex items-end h-12 gap-0.5">
          {histogram.map((count, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 rounded-t"
              style={{ height: `${(count / Math.max(...histogram)) * 100}%` }}
            />
          ))}
        </div>
      )}

      {/* Dual-handle slider */}
      <Slider.Root
        className="relative flex items-center w-full h-5 touch-none"
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onChange}
      >
        <Slider.Track className="relative h-1 w-full grow rounded-full bg-muted">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full bg-background border-2 border-primary shadow focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <Slider.Thumb className="block h-5 w-5 rounded-full bg-background border-2 border-primary shadow focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </Slider.Root>

      {/* Value labels */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
    </div>
  );
}
```

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Filter usage rate | Unknown | +30% | Track filter interactions |
| Zero-result searches | Unknown | -50% | Count empty state views |
| Time to first interaction | Unknown | < 10s | Analytics tracking |
| Mobile filter completion | Unknown | +25% | Track drawer open→apply |
| Search-to-detail rate | Unknown | +15% | Click-through tracking |

---

## Research Sources

- [Baymard Institute - Chrono24 UX Case Study](https://baymard.com/ux-benchmark/case-studies/chrono24)
- [Filter UX Design Best Practices - Lollypop](https://lollypop.design/blog/2025/july/filter-ux-design/)
- [15 Filter UI Patterns That Actually Work in 2025](https://bricxlabs.com/blogs/universal-search-and-filters-ui)
- [Faceted Search Best Practices - Fact-Finder](https://www.fact-finder.com/blog/faceted-search/)
- [Nielsen Norman Group - Filter Categories and Values](https://www.nngroup.com/articles/filter-categories-values/)
- [LogRocket - Faceted Filtering for E-commerce](https://blog.logrocket.com/ux-design/faceted-filtering-better-ecommerce-experiences/)
- [Airbnb Filter Fix Case Study - Medium](https://medium.com/design-bootcamp/airbnbs-filter-fix-small-change-big-win-54d3750aa505)
- [E-commerce Site Search Best Practices 2025](https://www.ecorn.agency/blog/ecommerce-site-search-best-practices)

---

## Next Steps

1. **Immediate:** Implement QW1 (Recently Listed sort) - highest impact, lowest effort
2. **This week:** QW2-QW4 (price presets, badge animation, condition colors)
3. **Next sprint:** ME1 (facet counts) - significant conversion impact
4. **Backlog:** ME2-ME4, MJ1-MJ3 for roadmap planning

---

*Review completed. Proceed to Review #4: Seller Profiles & Trust Building*
