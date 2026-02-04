# PolovniSatovi Performance Review

> A comprehensive analysis of the current performance setup and recommendations for maximum efficiency, speed, and responsiveness.

**Date:** February 2026
**Stack:** Next.js 16 (App Router), React 19, Prisma, Supabase, TypeScript

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Industry Best Practices (2025-2026)](#industry-best-practices-2025-2026)
4. [Gap Analysis & Recommendations](#gap-analysis--recommendations)
5. [Implementation Priority Matrix](#implementation-priority-matrix)
6. [Sources & References](#sources--references)

---

## Executive Summary

### Current Strengths ✅

The PolovniSatovi codebase demonstrates a solid performance foundation:

- **Multi-tier caching strategy** with appropriate TTLs (30s to 24h)
- **Image optimization** with AVIF/WebP and responsive sizes
- **Server-first architecture** with selective client components
- **Prisma singleton** with Supabase PgBouncer connection pooling
- **Skeleton/loading states** for perceived performance
- **Font optimization** with `display: swap`

### Key Improvement Areas 🎯

| Area | Impact | Effort | Priority |
|------|--------|--------|----------|
| Upgrade to Turbopack | High | Low | P0 |
| Implement `use cache` directive | High | Medium | P1 |
| Enable React Compiler | High | Low | P1 |
| Add database indexes | High | Low | P1 |
| Optimize bundle size | Medium | Medium | P2 |
| Implement INP optimizations | Medium | Medium | P2 |

---

## Current State Analysis

### 1. Build Configuration

**File:** [next.config.ts](../next.config.ts)

| Setting | Current | Optimal | Status |
|---------|---------|---------|--------|
| Bundler | Webpack | Turbopack | ⚠️ Upgrade recommended |
| Compression | ✅ Enabled | Enabled | ✅ Good |
| React Strict Mode | ✅ Enabled | Enabled | ✅ Good |
| Image Formats | AVIF, WebP | AVIF, WebP | ✅ Good |
| React Compiler | Not enabled | Enabled | ⚠️ Add |

**Current Webpack Configuration:**
```typescript
// Excludes Node.js modules from client bundle
// Prevents Prisma client bundling on client-side
// Bundle analyzer support with ANALYZE=true
```

### 2. Caching Strategy

**File:** [lib/cache.ts](../lib/cache.ts)

**Current Cache Tiers:**
| Tier | Duration | Use Case |
|------|----------|----------|
| INSTANT | 30s | Real-time data |
| SHORT | 60s | User-specific data |
| MEDIUM | 5m | Listings |
| LONG | 1h | Brands, static refs |
| STATIC | 24h | Blog, about pages |

**API Response Headers:** [lib/api-utils.ts](../lib/api-utils.ts)
- Uses `stale-while-revalidate` pattern
- Cache tags for granular invalidation
- Request-level memoization with React `cache()`

**Gap:** Not using Next.js 16's `use cache` directive and Cache Components pattern.

### 3. Database & Prisma

**File:** [lib/prisma.ts](../lib/prisma.ts)

**Current Setup:**
- ✅ Singleton pattern for serverless
- ✅ PgBouncer connection pooling via Supabase
- ✅ Conditional logging (dev vs prod)
- ✅ Graceful shutdown handler

**Schema:** [prisma/schema.prisma](../prisma/schema.prisma)
- Uses `cuid()` for IDs (better than UUIDs for PostgreSQL)
- Some indexes present (email unique, sellerId)
- Denormalized fields for performance

**Potential Issues:**
- Missing indexes on frequently filtered fields
- Some queries may create N+1 patterns
- Not using Prisma's `relationLoadStrategy: "join"`

### 4. Image Optimization

**File:** [lib/image-utils.ts](../lib/image-utils.ts)

| Feature | Status |
|---------|--------|
| Blur placeholders | ✅ Implemented |
| Responsive sizes | ✅ Grid + gallery configs |
| Lazy loading | ✅ Default behavior |
| Priority loading | ⚠️ Check above-fold images |
| Format optimization | ✅ AVIF/WebP |

### 5. Component Architecture

**Current Pattern:**
- Server Components (default) for data-heavy pages
- Client Components for interactivity
- Streaming with Suspense boundaries

**Loading States:**
| Route | Loading State |
|-------|---------------|
| `/` | ✅ Complex skeleton |
| `/listings` | ✅ Filter + grid skeleton |
| `/listing/[id]` | ✅ Gallery + details skeleton |
| `/dashboard` | ✅ Dashboard skeleton |

### 6. Middleware

**File:** [middleware.ts](../middleware.ts)

- ✅ Selective route matching (only protected routes)
- ✅ JWT-based authentication (fast verification)
- ✅ Edge-compatible

### 7. Third-Party Dependencies

**Potential Bundle Bloaters to Audit:**
- Date formatting libraries (moment vs date-fns)
- Icon libraries (full vs tree-shaken)
- UI component imports (full vs selective)

---

## Industry Best Practices (2025-2026)

### Next.js 16 Features

#### 1. Turbopack (Now Stable)

> Since Next.js 16, Turbopack is the default bundler for all new projects. Over 50% of development sessions and 20% of production builds were already using it.

**Benefits:**
- Faster cold starts (up to 10x)
- Faster HMR (Hot Module Replacement)
- Better tree-shaking
- Native support for modern JavaScript

**Migration:** Replace Webpack config with Turbopack-compatible options.

#### 2. Cache Components & `use cache`

> Cache Components represent a complete departure from implicit caching, making caching explicit and controllable.

```typescript
// New pattern in Next.js 16
async function ProductList() {
  "use cache";
  const products = await db.products.findMany();
  return <Grid items={products} />;
}
```

**Benefits:**
- Explicit caching boundaries
- Works with Partial Pre-Rendering (PPR)
- Instant navigation between cached routes

#### 3. React Compiler (Stable)

> The React Compiler reduces unnecessary re-renders with zero manual effort—no longer experimental in Next.js 16.

**What it does:**
- Automatically memoizes components
- Analyzes dependencies at build time
- Reduces runtime overhead of `useMemo`/`useCallback`

### Core Web Vitals (2025-2026 Targets)

| Metric | Target | Impact on SEO |
|--------|--------|---------------|
| LCP (Largest Contentful Paint) | < 2.5s | 25-30% ranking weight |
| INP (Interaction to Next Paint) | < 200ms | Critical for e-commerce |
| CLS (Cumulative Layout Shift) | < 0.1 | User experience |

> Only 47% of sites meet Google's thresholds. Sites meeting all three see 8-15% visibility boost.

### React 19 Server Components

**Best Practices:**
1. **Minimize client JavaScript** - Use Server Components for data-heavy content
2. **Proper boundaries** - Wrap only interactive elements in Client Components
3. **Async data fetching** - Fetch data inside Server Components
4. **Avoid client features** - No hooks or browser APIs in Server Components

### Prisma Optimization (2025)

#### Join Strategy Selection (v5.7.0+)

```typescript
// Use database-level joins instead of multiple queries
const users = await prisma.user.findMany({
  relationLoadStrategy: "join", // Single query with JOIN
  include: { posts: true }
});
```

#### Essential Indexes

```prisma
model Listing {
  // Add indexes on frequently filtered fields
  @@index([status, createdAt(sort: Desc)])
  @@index([brandId, status])
  @@index([priceEurCents])
  @@index([condition])
}
```

#### Bulk Operations

> Inserting 50,000 records in batches of 1,000 is more performant than 50,000 separate inserts.

### Supabase Connection Pooling

**Recommendations:**
- Use Supavisor (Supabase's built-in pooler) for serverless
- Limit pool size to 40% if using PostgREST, otherwise 80%
- Monitor connections via Supabase Grafana Dashboard
- Avoid too many direct connections (impacts query throughput)

### Bundle Size Reduction

| Technique | Typical Savings |
|-----------|-----------------|
| Dynamic imports | ~30% |
| Replace moment.js with date-fns | ~90% of date library |
| Tree-shake icons | ~50-70% |
| Server Components for logic | Variable |
| optimizePackageImports | ~20-40% on specific packages |

---

## Gap Analysis & Recommendations

### P0 - Critical (Do Immediately)

#### 1. Upgrade to Turbopack

**Current:** Using Webpack with custom configuration
**Issue:** Slower builds, less efficient bundling
**Solution:**

```typescript
// next.config.ts
const nextConfig = {
  // Remove webpack configuration
  // Turbopack is now default in Next.js 16
  experimental: {
    turbo: {
      // Turbopack-specific options
    }
  }
};
```

**Expected Impact:** 2-10x faster development builds, improved production bundles

---

### P1 - High Priority

#### 2. Enable React Compiler

**Current:** Not enabled
**Solution:**

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  }
};
```

**Expected Impact:** Automatic memoization, reduced re-renders, improved INP

#### 3. Implement `use cache` Directive

**Current:** Using `unstable_cache` from Next.js
**Solution:** Migrate to stable `use cache` pattern

```typescript
// Before
import { unstable_cache } from "next/cache";
const getCachedListings = unstable_cache(
  async () => await db.listing.findMany(),
  ["listings"],
  { revalidate: 300 }
);

// After (Next.js 16)
async function getListings() {
  "use cache";
  return await db.listing.findMany();
}
```

#### 4. Add Missing Database Indexes

**Files to update:** [prisma/schema.prisma](../prisma/schema.prisma)

```prisma
model Listing {
  // Existing fields...

  // ADD: Composite index for listing queries
  @@index([status, createdAt(sort: Desc)])

  // ADD: Index for brand filtering
  @@index([brandId, status])

  // ADD: Index for price range queries
  @@index([priceEurCents])

  // ADD: Index for condition filtering
  @@index([condition, status])

  // ADD: Full-text search index (if using PostgreSQL FTS)
  // @@index([title, description], type: GIN)
}

model User {
  // ADD: Index for seller queries
  @@index([role, isVerifiedSeller])
}
```

#### 5. Implement `relationLoadStrategy: "join"`

**Current:** Default strategy (multiple queries)
**Solution:**

```typescript
// lib/listings.ts
const listings = await prisma.listing.findMany({
  relationLoadStrategy: "join", // ADD THIS
  where: { status: "APPROVED" },
  include: {
    photos: true,
    seller: { include: { sellerProfile: true } }
  }
});
```

**Expected Impact:** Reduce database round-trips by 50-70%

---

### P2 - Medium Priority

#### 6. Optimize Bundle Size

**Actions:**

1. **Audit dependencies:**
   ```bash
   ANALYZE=true npm run build
   ```

2. **Add optimizePackageImports:**
   ```typescript
   // next.config.ts
   const nextConfig = {
     experimental: {
       optimizePackageImports: [
         'lucide-react',
         '@radix-ui/react-icons',
         'date-fns',
         // Add other large packages
       ],
     }
   };
   ```

3. **Dynamic imports for heavy components:**
   ```typescript
   import dynamic from 'next/dynamic';

   const HeavyChart = dynamic(() => import('./Chart'), {
     loading: () => <ChartSkeleton />,
     ssr: false
   });
   ```

#### 7. Improve INP (Interaction to Next Paint)

**Actions:**

1. **Use `useTransition` for expensive updates:**
   ```typescript
   const [isPending, startTransition] = useTransition();

   function handleFilter(value: string) {
     startTransition(() => {
       setFilters({ ...filters, brand: value });
     });
   }
   ```

2. **Defer non-critical updates:**
   ```typescript
   // Immediate UI feedback
   setIsLoading(true);

   // Defer heavy work
   requestIdleCallback(() => {
     processAnalytics();
   });
   ```

3. **Optimize event handlers:**
   - Debounce search inputs
   - Throttle scroll handlers
   - Use passive event listeners

#### 8. Preload Critical Resources

```typescript
// app/layout.tsx
import { preload } from 'react-dom';

export default function RootLayout({ children }) {
  // Preload critical fonts
  preload('/fonts/inter-var.woff2', { as: 'font', type: 'font/woff2' });

  // Preload hero image
  preload('/hero-watch.webp', { as: 'image' });

  return <html>...</html>;
}
```

#### 9. Implement Streaming with Suspense

**Current:** Some loading states implemented
**Enhancement:**

```typescript
// app/listings/page.tsx
import { Suspense } from 'react';

export default function ListingsPage() {
  return (
    <>
      {/* Render filters immediately */}
      <FilterBar />

      {/* Stream listings as they load */}
      <Suspense fallback={<ListingGridSkeleton />}>
        <ListingGrid />
      </Suspense>

      {/* Stream facets separately */}
      <Suspense fallback={<FacetsSkeleton />}>
        <Facets />
      </Suspense>
    </>
  );
}
```

---

### P3 - Nice to Have

#### 10. Implement Service Worker for Offline Support

```typescript
// app/manifest.ts (already exists)
// Add service worker registration

// public/sw.js
self.addEventListener('fetch', (event) => {
  // Cache static assets
  // Serve cached listings when offline
});
```

#### 11. Add Real User Monitoring (RUM)

```typescript
// lib/web-vitals.ts
import { onLCP, onINP, onCLS } from 'web-vitals';

export function reportWebVitals() {
  onLCP(console.log);
  onINP(console.log);
  onCLS(console.log);
}
```

#### 12. Implement Edge Caching with Vercel

```typescript
// Leverage Vercel's edge network
export const runtime = 'edge'; // For suitable API routes

// Use edge-compatible caching
export const revalidate = 300; // 5 minutes
```

---

## Implementation Priority Matrix

```
                    IMPACT
                      ↑
         HIGH  │  P1   │  P0
               │       │
        MEDIUM │  P2   │  P1
               │       │
          LOW  │  P3   │  P2
               └───────┴────────→
                 HIGH    LOW
                      EFFORT
```

### Recommended Implementation Order

| Phase | Items | Timeline |
|-------|-------|----------|
| **Phase 1** | Turbopack, React Compiler, Database indexes | Week 1 |
| **Phase 2** | `use cache`, Join strategy, Bundle optimization | Week 2 |
| **Phase 3** | INP improvements, Streaming, Preloading | Week 3 |
| **Phase 4** | Service worker, RUM, Edge optimization | Week 4 |

---

## Performance Monitoring Checklist

### Before Implementation
- [ ] Run Lighthouse audit (baseline)
- [ ] Record Core Web Vitals (LCP, INP, CLS)
- [ ] Analyze bundle size (`ANALYZE=true npm run build`)
- [ ] Profile database queries (Prisma Optimize or pg_stat_statements)

### After Each Phase
- [ ] Re-run Lighthouse
- [ ] Compare Core Web Vitals
- [ ] Check bundle size delta
- [ ] Verify no regressions

### Ongoing
- [ ] Set up Real User Monitoring
- [ ] Monitor Supabase connection pool usage
- [ ] Review Vercel Analytics weekly
- [ ] Run Prisma Optimize periodically

---

## Sources & References

### Next.js & React
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [Next.js Performance Optimization (2025)](https://pagepro.co/blog/nextjs-performance-optimization-in-9-steps/)
- [Expert Guide to Next.js Performance](https://blazity.com/the-expert-guide-to-nextjs-performance-optimization)
- [React & Next.js Best Practices 2026](https://fabwebstudio.com/blog/react-nextjs-best-practices-2026-performance-scale)
- [Next.js 15 Performance Strategies](https://www.luxisdesign.io/blog/nextjs-15-performance-optimization-strategies-for-2025-1)

### React 19 & Server Components
- [React 19 Performance Optimization](https://reliasoftware.com/blog/performance-optimization-in-react)
- [React Server Components Performance](https://www.developerway.com/posts/react-server-components-performance)
- [React 19 Key Features for 2026](https://colorwhistle.com/latest-react-features/)

### Core Web Vitals
- [Core Web Vitals Optimization Guide 2025](https://www.digitalapplied.com/blog/core-web-vitals-optimization-guide-2025)
- [Optimizing Next.js 15 for Core Web Vitals](https://codewithlucifer.com/blog/optimizing-next-js-15-apps-for-core-web-vitals-in-2025)
- [Vercel Core Web Vitals Guide](https://vercel.com/kb/guide/optimizing-core-web-vitals-in-2024)

### Prisma & Database
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)
- [Optimizing PostgreSQL with Prisma](https://www.prisma.io/dataguide/postgresql/reading-and-querying-data/optimizing-postgresql)
- [Prisma 6 Performance Features](https://www.prisma.io/blog/prisma-6-better-performance-more-flexibility-and-type-safe-sql)

### Supabase
- [Supabase Connection Management](https://supabase.com/docs/guides/database/connection-management)
- [Supavisor: Scaling Postgres](https://supabase.com/blog/supavisor-1-million)
- [Supabase Postgres Best Practices](https://supaexplorer.com/best-practices/supabase-postgres/)

### Bundle Optimization
- [Next.js Bundle Analyzer](http://www.catchmetrics.io/blog/reducing-nextjs-bundle-size-with-nextjs-bundle-analyzer)
- [Reducing Bundle Size in Next.js](https://moldstud.com/articles/p-reducing-bundle-size-in-nextjs-techniques-for-performance-gains)
- [JavaScript Bundle Size Reduction 2025](https://dev.to/frontendtoolstech/how-to-reduce-javascript-bundle-size-in-2025-2n77)

---

## Quick Reference Card

### Immediate Wins (< 1 hour each)
```bash
# 1. Enable bundle analyzer
ANALYZE=true npm run build

# 2. Add React Compiler (next.config.ts)
experimental: { reactCompiler: true }

# 3. Run Prisma migration with new indexes
npm run prisma:migrate
```

### Code Patterns to Adopt
```typescript
// ✅ Use cache directive (Next.js 16)
async function getData() {
  "use cache";
  return await db.query();
}

// ✅ Use join strategy (Prisma)
prisma.model.findMany({
  relationLoadStrategy: "join",
  include: { relation: true }
});

// ✅ Use transitions for expensive updates
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(value));

// ✅ Dynamic imports for heavy components
const Heavy = dynamic(() => import('./Heavy'), { ssr: false });
```

---

*Document generated for PolovniSatovi performance optimization planning.*
