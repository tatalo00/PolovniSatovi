# Performance Review: PolovniSatovi

## Executive Summary
The project is built on a modern stack (Next.js 16, React 19, Prisma) which provides a solid foundation for performance. However, there are significant opportunities to improve page load times and responsiveness, particularly on the Listings page which is the core of the marketplace.

## Critical Findings (High Impact)

### 1. Listings Page Caching Strategy
**Location:** `web/app/listings/page.tsx`
**Issue:** The listings page currently runs complex database queries on every request. While `revalidate = 300` is set, the usage of `searchParams` opts the page into dynamic rendering at request time. This means every user filtering or sorting triggers a database hit.
**Recommendation:** Implement `unstable_cache` for the `runQueries` function, using a cache key derived from the normalized search parameters. This will cache the results of specific filter combinations, significantly reducing database load and TTFB (Time To First Byte).

### 2. Image Optimization
**Location:** Global
**Issue:** While `next/image` is used, we need to ensure `sizes` attributes are perfectly tuned for the grid layout to prevent downloading larger images than necessary.
**Recommendation:** Audit all `Image` components, especially in `ListingGrid`, to ensure `sizes` prop matches the responsive breakpoints (e.g., `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`).

## Optimization Opportunities (Medium Impact)

### 3. Database Query Optimization
**Location:** `web/prisma/schema.prisma`
**Issue:** Several fields used for filtering and sorting are missing indexes, which could lead to slow queries as the dataset grows.
**Missing Indexes:**
-   `year`: Used for filtering and sorting (`orderBy: { year: 'desc' }`).
-   `reference`: Critical for searching specific watch models.
-   `sellerId`: Foreign key, should be indexed for join performance.
-   `[status, year]`: Composite index for efficient sorting of approved listings.

**Recommendation:** Add the following indexes to the `Listing` model:
```prisma
@@index([year])
@@index([reference])
@@index([sellerId])
@@index([status, year])
```

### 4. Client-Side Bundle Size
**Location:** `web/components/site/navbar.tsx`
**Issue:** The Navbar is a large client component.
**Recommendation:** Verify that heavy dependencies are not accidentally bundled. `lucide-react` is tree-shakeable, so it should be fine, but we should keep an eye on imports.

### 5. Scroll Restoration Logic
**Location:** `web/components/listings/listing-content.tsx`
**Issue:** Custom scroll restoration logic is implemented.
**Recommendation:** Ensure this doesn't conflict with Next.js 16's native scroll handling, which might cause jankiness.

## Proposed Action Plan

1.  **Implement Caching for Listings**: Wrap the `runQueries` function in `web/app/listings/page.tsx` with `unstable_cache`.
2.  **Optimize Images**: Review and update `sizes` prop in `ListingGrid` and `Hero`.
3.  **Verify Indexes**: Ensure all filter columns in `schema.prisma` are covered by composite indexes where appropriate (already looks good, but worth a double-check against actual query patterns).
4.  **Enable Partial Prerendering (PPR)**: Explore enabling PPR (experimental in Next.js 15/16) to serve the static shell of the listings page instantly while streaming in the dynamic content.
