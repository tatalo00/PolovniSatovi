# Performance Implementation Plan

> Step-by-step implementation guide based on the [Performance Review](./PERFORMANCE_REVIEW.md)

**Project:** PolovniSatovi
**Date:** February 2026
**Estimated Duration:** 4 Phases

---

## Pre-Implementation Checklist

### Baseline Metrics (Capture Before Starting)

```bash
# 1. Run Lighthouse audit on key pages
# - Homepage (/)
# - Listings page (/listings)
# - Single listing (/listing/[id])
# - Dashboard (/dashboard)

# 2. Analyze current bundle size
cd web && ANALYZE=true npm run build

# 3. Record Core Web Vitals from Vercel Analytics or PageSpeed Insights
# - LCP: _____ ms (target: <2500ms)
# - INP: _____ ms (target: <200ms)
# - CLS: _____ (target: <0.1)

# 4. Note current build time
# Dev server startup: _____ seconds
# Production build: _____ seconds
```

---

## Phase 1: Build & Compiler Optimizations

**Goal:** Faster builds, automatic optimizations
**Risk Level:** Low
**Estimated Effort:** 2-4 hours

### Task 1.1: Enable React Compiler

**File:** `next.config.ts`

**Why:** Automatic memoization, reduced re-renders, improved INP with zero code changes.

**Steps:**

1. Install the React Compiler Babel plugin (if not already included in Next.js 16):
   ```bash
   npm install babel-plugin-react-compiler --save-dev
   ```

2. Update `next.config.ts`:
   ```typescript
   const baseConfig: NextConfig = {
     // ... existing config
     experimental: {
       reactCompiler: true,
     },
   };
   ```

3. Test the build:
   ```bash
   npm run build
   ```

4. Verify no runtime errors in dev mode:
   ```bash
   npm run dev
   ```

**Validation:**
- [ ] Build completes without errors
- [ ] No console warnings about React Compiler
- [ ] Interactive elements still work correctly

---

### Task 1.2: Add optimizePackageImports

**File:** `next.config.ts`

**Why:** Automatic tree-shaking for large packages, reducing bundle size by 20-40%.

**Steps:**

1. Update `next.config.ts`:
   ```typescript
   const baseConfig: NextConfig = {
     // ... existing config
     experimental: {
       reactCompiler: true,
       optimizePackageImports: [
         'lucide-react',
         'date-fns',
         '@radix-ui/react-accordion',
         '@radix-ui/react-alert-dialog',
         '@radix-ui/react-avatar',
         '@radix-ui/react-checkbox',
         '@radix-ui/react-dialog',
         '@radix-ui/react-dropdown-menu',
         '@radix-ui/react-label',
         '@radix-ui/react-popover',
         '@radix-ui/react-select',
         '@radix-ui/react-separator',
         '@radix-ui/react-slider',
         '@radix-ui/react-slot',
         '@radix-ui/react-switch',
         '@radix-ui/react-tabs',
         '@radix-ui/react-toast',
         '@radix-ui/react-tooltip',
       ],
     },
   };
   ```

2. Run bundle analyzer to compare:
   ```bash
   ANALYZE=true npm run build
   ```

**Validation:**
- [ ] Bundle size reduced (compare analyzer output)
- [ ] No missing icons or components
- [ ] All UI elements render correctly

---

### Task 1.3: Evaluate Turbopack Migration

**File:** `next.config.ts`

**Why:** 2-10x faster dev builds, better tree-shaking.

**Current Blocker:** Webpack config is used for Prisma client compatibility.

**Investigation Steps:**

1. Test Turbopack in development:
   ```bash
   npm run dev -- --turbopack
   ```

2. Check for errors related to:
   - Prisma client imports on client-side
   - Node.js module resolution
   - Path aliases

3. If Turbopack works, simplify config:
   ```typescript
   const baseConfig: NextConfig = {
     // Remove webpack function entirely
     // Keep turbopack: {} or configure as needed
     experimental: {
       reactCompiler: true,
       optimizePackageImports: [...],
       turbo: {
         resolveAlias: {
           // Add any necessary aliases
         },
       },
     },
   };
   ```

4. If Turbopack fails with Prisma, keep Webpack but document the issue for future resolution.

**Validation:**
- [ ] Dev server starts without errors
- [ ] HMR works correctly
- [ ] Prisma queries execute without issues
- [ ] Client-side navigation works

---

## Phase 2: Caching Improvements

**Goal:** Faster page loads, reduced server load
**Risk Level:** Medium
**Estimated Effort:** 4-6 hours

### Task 2.1: Migrate to `use cache` Directive

**Files:** `lib/cache.ts`, `lib/listings.ts`, and data-fetching functions

**Why:** Explicit caching boundaries, works with PPR, cleaner code.

**Steps:**

1. Update `lib/cache.ts` to support both patterns during migration:
   ```typescript
   import "server-only";
   import { unstable_cache } from "next/cache";
   import { cache } from "react";
   import { cacheLife, cacheTag } from "next/cache";

   // New cache life profiles (Next.js 16)
   export const CACHE_PROFILES = {
     instant: cacheLife("seconds", 30),
     short: cacheLife("minutes", 1),
     medium: cacheLife("minutes", 5),
     long: cacheLife("hours", 1),
     static: cacheLife("days", 1),
   };

   // Keep existing REVALIDATE for backward compatibility
   export const REVALIDATE = {
     INSTANT: 30,
     SHORT: 60,
     MEDIUM: 300,
     LONG: 3600,
     STATIC: 86400,
   } as const;
   ```

2. Create new cached data functions using `use cache`:
   ```typescript
   // lib/listings-cached.ts
   import { cacheTag } from "next/cache";

   export async function getCachedListings(filters: ListingFilters) {
     "use cache";
     cacheTag("listings");

     // Existing query logic
     return await prisma.listing.findMany({
       relationLoadStrategy: "join",
       where: buildWhereClause(filters),
       include: {
         photos: true,
         seller: { include: { sellerProfile: true } },
       },
     });
   }
   ```

3. Migrate one route at a time, starting with `/listings`:
   - Update data fetching to use new cached functions
   - Test thoroughly before moving to next route

**Migration Order:**
1. `/listings` - High traffic, good test case
2. `/listing/[id]` - Individual listing pages
3. `/` - Homepage featured listings
4. `/sellers/[slug]` - Seller profiles
5. API routes - Lower priority

**Validation:**
- [ ] Pages load correctly with cached data
- [ ] Cache invalidation works (test by updating a listing)
- [ ] No stale data issues

---

### Task 2.2: Implement `relationLoadStrategy: "join"`

**Files:** All Prisma queries with `include`

**Why:** Reduces database round-trips by 50-70%.

**Steps:**

1. Search for all queries with `include`:
   ```bash
   grep -r "include:" lib/ app/ --include="*.ts" --include="*.tsx"
   ```

2. Add `relationLoadStrategy: "join"` to each query:
   ```typescript
   // Before
   const listing = await prisma.listing.findUnique({
     where: { id },
     include: {
       photos: true,
       seller: { include: { sellerProfile: true } },
     },
   });

   // After
   const listing = await prisma.listing.findUnique({
     where: { id },
     relationLoadStrategy: "join",
     include: {
       photos: true,
       seller: { include: { sellerProfile: true } },
     },
   });
   ```

3. Key files to update:
   - `lib/listings.ts` - Main listings queries
   - `app/listing/[id]/page.tsx` - Single listing
   - `app/api/listings/route.ts` - API endpoint
   - `app/api/listings/[id]/route.ts` - Single listing API
   - `app/dashboard/listings/page.tsx` - User's listings
   - `app/admin/listings/page.tsx` - Admin listings

**Validation:**
- [ ] Query results are identical
- [ ] Check Prisma logs for single JOIN query instead of multiple queries
- [ ] Response times improved

---

### Task 2.3: Add Stale-While-Revalidate Headers

**Files:** API routes in `app/api/`

**Why:** Serve stale content immediately while refreshing in background.

**Steps:**

1. Ensure all public API routes use proper cache headers:
   ```typescript
   // app/api/listings/route.ts
   import { CACHE_CONTROL } from "@/lib/api-utils";

   export async function GET(request: Request) {
     // ... fetch logic

     return Response.json(data, {
       headers: {
         "Cache-Control": CACHE_CONTROL.SHORT, // public, s-maxage=300, stale-while-revalidate=600
       },
     });
   }
   ```

2. Audit all API routes for cache headers:
   - `/api/listings` - PUBLIC, SHORT cache
   - `/api/listings/[id]` - PUBLIC, SHORT cache
   - `/api/listings/facets` - PUBLIC, SHORT cache
   - `/api/brands` - PUBLIC, LONG cache
   - `/api/user/*` - PRIVATE or NONE
   - `/api/messages/*` - PRIVATE

**Validation:**
- [ ] Response headers show correct Cache-Control values
- [ ] Vercel dashboard shows cache HIT rate increasing

---

## Phase 3: Client-Side Performance

**Goal:** Better INP, faster interactions
**Risk Level:** Medium
**Estimated Effort:** 4-6 hours

### Task 3.1: Implement useTransition for Filters

**Files:** `components/listings/listing-filters.tsx` and similar filter components

**Why:** Keeps UI responsive during expensive state updates.

**Steps:**

1. Identify filter components that trigger re-renders:
   ```bash
   grep -r "setFilters\|setSearchParams\|router.push" components/ --include="*.tsx"
   ```

2. Wrap expensive updates with `useTransition`:
   ```typescript
   // Before
   function handleBrandChange(brand: string) {
     setFilters({ ...filters, brand });
   }

   // After
   import { useTransition } from "react";

   function FilterComponent() {
     const [isPending, startTransition] = useTransition();

     function handleBrandChange(brand: string) {
       startTransition(() => {
         setFilters({ ...filters, brand });
       });
     }

     return (
       <Select
         onChange={handleBrandChange}
         disabled={isPending}
         className={isPending ? "opacity-50" : ""}
       />
     );
   }
   ```

3. Add pending indicators where appropriate:
   ```typescript
   {isPending && <Spinner className="ml-2" />}
   ```

**Key Components to Update:**
- `components/listings/listing-filters.tsx`
- `components/home/quick-filter-bar.tsx`
- `components/site/global-search-dialog.tsx`

**Validation:**
- [ ] Filters feel responsive even with many results
- [ ] INP metric improved in Lighthouse
- [ ] No visual glitches during transitions

---

### Task 3.2: Add Debouncing to Search Inputs

**Files:** Search and text input components

**Why:** Prevents excessive re-renders and API calls.

**Steps:**

1. Create a debounce hook if not exists:
   ```typescript
   // lib/hooks/use-debounce.ts
   import { useState, useEffect } from "react";

   export function useDebounce<T>(value: T, delay: number = 300): T {
     const [debouncedValue, setDebouncedValue] = useState<T>(value);

     useEffect(() => {
       const timer = setTimeout(() => setDebouncedValue(value), delay);
       return () => clearTimeout(timer);
     }, [value, delay]);

     return debouncedValue;
   }
   ```

2. Apply to search inputs:
   ```typescript
   function SearchInput() {
     const [query, setQuery] = useState("");
     const debouncedQuery = useDebounce(query, 300);

     useEffect(() => {
       if (debouncedQuery) {
         performSearch(debouncedQuery);
       }
     }, [debouncedQuery]);

     return <Input value={query} onChange={(e) => setQuery(e.target.value)} />;
   }
   ```

**Validation:**
- [ ] Search doesn't trigger on every keystroke
- [ ] Network tab shows fewer requests during typing
- [ ] Search still feels responsive

---

### Task 3.3: Dynamic Imports for Heavy Components

**Files:** Components with charts, maps, or heavy libraries

**Why:** Reduces initial bundle size, faster page loads.

**Steps:**

1. Identify heavy components:
   ```bash
   # Check bundle analyzer output for large modules
   ANALYZE=true npm run build
   ```

2. Convert to dynamic imports:
   ```typescript
   // Before
   import { ListingImageGallery } from "@/components/listings/listing-image-gallery";

   // After
   import dynamic from "next/dynamic";

   const ListingImageGallery = dynamic(
     () => import("@/components/listings/listing-image-gallery").then(m => m.ListingImageGallery),
     {
       loading: () => <ImageGallerySkeleton />,
       ssr: true, // Keep SSR for SEO
     }
   );
   ```

**Candidates for Dynamic Import:**
- Image gallery with lightbox
- Charts/graphs (if any)
- Map components (if any)
- Rich text editors
- PDF viewers

**Validation:**
- [ ] Initial page load is faster
- [ ] Dynamic components load smoothly
- [ ] No layout shift when components appear

---

### Task 3.4: Optimize Images for LCP

**Files:** Homepage, listing pages, any above-fold images

**Why:** LCP is often determined by the largest image.

**Steps:**

1. Ensure hero/featured images have `priority`:
   ```typescript
   // app/page.tsx or homepage component
   <Image
     src={heroImage}
     alt="Featured watch"
     priority // Add this for above-fold images
     sizes="(max-width: 768px) 100vw, 50vw"
   />
   ```

2. Add `fetchpriority="high"` to critical images:
   ```typescript
   <Image
     src={mainImage}
     alt="..."
     priority
     fetchPriority="high"
   />
   ```

3. Ensure proper `sizes` attribute on all images:
   ```typescript
   // Grid images
   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"

   // Full-width images
   sizes="100vw"

   // Sidebar images
   sizes="(max-width: 768px) 100vw, 300px"
   ```

**Validation:**
- [ ] LCP improved in Lighthouse
- [ ] No images without sizes attribute
- [ ] Above-fold images load first

---

## Phase 4: Monitoring & Advanced Optimizations

**Goal:** Ongoing performance tracking, edge optimizations
**Risk Level:** Low
**Estimated Effort:** 2-4 hours

### Task 4.1: Implement Web Vitals Reporting

**Files:** `lib/web-vitals.ts`, `app/layout.tsx`

**Why:** Track real user performance metrics.

**Steps:**

1. Install web-vitals:
   ```bash
   npm install web-vitals
   ```

2. Create reporting utility:
   ```typescript
   // lib/web-vitals.ts
   import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";

   type MetricHandler = (metric: {
     name: string;
     value: number;
     rating: "good" | "needs-improvement" | "poor";
   }) => void;

   export function reportWebVitals(handler: MetricHandler) {
     onLCP(handler);
     onINP(handler);
     onCLS(handler);
     onFCP(handler);
     onTTFB(handler);
   }

   // Send to analytics (Vercel Analytics, Google Analytics, etc.)
   export function sendToAnalytics(metric: { name: string; value: number }) {
     // Vercel Analytics automatically captures these
     // Or send to your own endpoint:
     if (process.env.NODE_ENV === "production") {
       fetch("/api/analytics/vitals", {
         method: "POST",
         body: JSON.stringify(metric),
         headers: { "Content-Type": "application/json" },
       });
     }
   }
   ```

3. Initialize in layout:
   ```typescript
   // components/web-vitals-reporter.tsx
   "use client";

   import { useEffect } from "react";
   import { reportWebVitals, sendToAnalytics } from "@/lib/web-vitals";

   export function WebVitalsReporter() {
     useEffect(() => {
       reportWebVitals(sendToAnalytics);
     }, []);

     return null;
   }

   // Add to app/layout.tsx
   <WebVitalsReporter />
   ```

**Validation:**
- [ ] Metrics being captured in production
- [ ] Dashboard shows real user data
- [ ] Can identify pages with poor performance

---

### Task 4.2: Add Performance Monitoring Dashboard

**Options:**
1. **Vercel Analytics** (recommended, built-in)
2. **Sentry Performance**
3. **Custom dashboard with Grafana**

**Steps for Vercel Analytics:**

1. Enable in Vercel dashboard:
   - Project Settings → Analytics → Enable

2. Install package:
   ```bash
   npm install @vercel/analytics
   ```

3. Add to layout:
   ```typescript
   // app/layout.tsx
   import { Analytics } from "@vercel/analytics/react";

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

**Validation:**
- [ ] Vercel Analytics dashboard shows data
- [ ] Core Web Vitals scores visible
- [ ] Can filter by route

---

### Task 4.3: Set Up Performance Alerts

**Why:** Get notified when performance degrades.

**Options:**
1. Vercel deployment checks
2. GitHub Actions with Lighthouse CI
3. Custom monitoring with alerts

**Steps for Lighthouse CI:**

1. Create `.github/workflows/lighthouse.yml`:
   ```yaml
   name: Lighthouse CI
   on: [push]
   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Run Lighthouse
           uses: treosh/lighthouse-ci-action@v10
           with:
             urls: |
               https://polovnisatovi.com/
               https://polovnisatovi.com/listings
             budgetPath: ./lighthouse-budget.json
             uploadArtifacts: true
   ```

2. Create `lighthouse-budget.json`:
   ```json
   [
     {
       "path": "/*",
       "resourceSizes": [
         { "resourceType": "script", "budget": 300 },
         { "resourceType": "total", "budget": 1000 }
       ],
       "timings": [
         { "metric": "interactive", "budget": 3000 },
         { "metric": "largest-contentful-paint", "budget": 2500 }
       ]
     }
   ]
   ```

**Validation:**
- [ ] CI runs on every push
- [ ] Failed budgets block merge
- [ ] Historical data available

---

## Post-Implementation Checklist

### Metrics Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| LCP (ms) | | | |
| INP (ms) | | | |
| CLS | | | |
| Bundle Size (KB) | | | |
| Build Time (s) | | | |
| Dev Startup (s) | | | |

### Verification Tests

- [ ] All pages load without errors
- [ ] All interactive elements work
- [ ] No console errors in production
- [ ] Search and filters work correctly
- [ ] Images load properly
- [ ] Authentication flows work
- [ ] API responses are correct
- [ ] Mobile experience is good

### Documentation Updates

- [ ] Update CLAUDE.md with new patterns
- [ ] Document any breaking changes
- [ ] Update team on new conventions

---

## Rollback Plan

If issues arise after deployment:

1. **Revert React Compiler:**
   ```typescript
   // Remove from next.config.ts
   experimental: {
     // reactCompiler: true, // Comment out
   }
   ```

2. **Revert to unstable_cache:**
   - Keep original cache.ts functions
   - Swap imports back

3. **Remove optimizePackageImports:**
   - Simply remove from config

4. **Full rollback:**
   ```bash
   git revert HEAD~n  # Revert last n commits
   ```

---

## Summary

### Quick Wins (Do First)
1. Enable React Compiler - ~15 minutes
2. Add optimizePackageImports - ~15 minutes
3. Add `priority` to above-fold images - ~30 minutes

### High Impact (Do This Week)
4. Implement `relationLoadStrategy: "join"` - ~2 hours
5. Add useTransition to filters - ~2 hours
6. Migrate critical routes to `use cache` - ~4 hours

### Ongoing
7. Monitor Web Vitals
8. Review bundle size monthly
9. Profile database queries quarterly

---

*Implementation plan for PolovniSatovi performance optimization.*
*Reference: [PERFORMANCE_REVIEW.md](./PERFORMANCE_REVIEW.md)*
