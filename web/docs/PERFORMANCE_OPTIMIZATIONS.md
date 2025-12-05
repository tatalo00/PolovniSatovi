# Performance Optimizations

This document outlines the performance optimizations implemented to improve page latency and overall application performance.

## Implemented Optimizations

### 1. Next.js Caching Strategy

#### Page-Level Caching
- **Homepage (`/`)**: Revalidates every 5 minutes (300 seconds)
- **Listings Page (`/listings`)**: Revalidates every 5 minutes
- **Listing Detail Page (`/listing/[id]`)**: Revalidates every 5 minutes

#### Database Query Caching
- Implemented `unstable_cache` for frequently accessed data
- Homepage listings are cached with tag-based invalidation
- Cache tags allow selective invalidation when listings are updated

**Cache Configuration:**
- `REVALIDATE.SHORT`: 60 seconds (1 minute)
- `REVALIDATE.MEDIUM`: 300 seconds (5 minutes) - Default for most pages
- `REVALIDATE.LONG`: 3600 seconds (1 hour)
- `REVALIDATE.VERY_LONG`: 86400 seconds (24 hours)

### 2. API Route Optimization

#### Cache Headers
- Public listing API routes include `Cache-Control` headers
- `s-maxage=300`: Cache for 5 minutes at CDN/edge
- `stale-while-revalidate=600`: Serve stale content while revalidating for up to 10 minutes

**Example:**
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

### 3. Image Optimization

#### Next.js Image Configuration
- **Formats**: AVIF and WebP (automatic format selection)
- **Minimum Cache TTL**: 60 seconds
- **Device Sizes**: Optimized breakpoints for responsive images
- **Image Sizes**: Multiple sizes for different use cases

All images use the Next.js `Image` component with:
- Lazy loading
- Proper `sizes` attribute for responsive images
- Automatic format optimization

### 4. Database Query Optimization

#### Composite Indexes
Added composite indexes for common query patterns:

```prisma
@@index([status, priceEurCents])
@@index([status, createdAt])
@@index([status, brand])
@@index([status, priceEurCents, createdAt])
```

These indexes optimize:
- Filtered listings by status with price sorting
- Filtered listings by status with date sorting
- Filtered listings by status and brand
- Complex queries combining status, price, and date

#### Query Patterns
- Parallel queries using `Promise.all()` where possible
- Selective field fetching (only required fields)
- Proper use of `take` and `skip` for pagination

### 5. Code Splitting & Dynamic Imports

#### Dynamic Component Loading
- Heavy components like `ListingReviewsSection` are dynamically imported
- Reduces initial bundle size
- Components load on-demand with loading states

**Example:**
```typescript
const ListingReviewsSection = dynamic(
  () => import("@/components/reviews/listing-reviews-section"),
  { 
    ssr: true,
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />
  }
);
```

### 6. Next.js Configuration Optimizations

#### Build Optimizations
- **Compression**: Enabled (`compress: true`)
- **SWC Minification**: Enabled for faster builds
- **React Strict Mode**: Enabled for better performance and debugging

#### Bundle Optimization
- Prisma client excluded from client-side bundle
- Node.js modules properly externalized
- Webpack configuration optimized for serverless

## Performance Impact

### Expected Improvements

1. **Page Load Time**: 40-60% reduction for cached pages
2. **Database Load**: 70-80% reduction for frequently accessed data
3. **API Response Time**: 50-70% faster for cached endpoints
4. **Image Loading**: 30-50% faster with optimized formats and sizes
5. **Bundle Size**: 10-20% reduction with code splitting

### Cache Invalidation

Cache can be invalidated using tags:

```typescript
import { revalidateTag } from "next/cache";

// Invalidate all listings
revalidateTag(CACHE_TAGS.listings);

// Invalidate specific listing
revalidateTag(CACHE_TAGS.listing(listingId));
```

## Monitoring & Metrics

### Key Metrics to Monitor

1. **Time to First Byte (TTFB)**: Should be < 200ms for cached pages
2. **First Contentful Paint (FCP)**: Should be < 1.5s
3. **Largest Contentful Paint (LCP)**: Should be < 2.5s
4. **Database Query Time**: Monitor slow queries
5. **Cache Hit Rate**: Track cache effectiveness

### Tools

- Next.js Analytics (if enabled)
- Vercel Analytics
- Database query logs
- Browser DevTools Performance tab

## Best Practices

### When Adding New Pages

1. Set appropriate `revalidate` time based on data freshness requirements
2. Use `unstable_cache` for database queries
3. Add cache tags for selective invalidation
4. Use dynamic imports for heavy components

### When Adding New API Routes

1. Add cache headers for public endpoints
2. Use appropriate cache duration based on data volatility
3. Consider user-specific data (don't cache user-specific responses)

### Database Queries

1. Use composite indexes for common query patterns
2. Select only required fields
3. Use `Promise.all()` for parallel queries
4. Implement proper pagination

## Migration Required

After deploying these changes, run the Prisma migration to add the new composite indexes:

```bash
npx prisma migrate dev --name add_composite_indexes
```

Or in production:

```bash
npx prisma migrate deploy
```

## Future Optimizations

Potential future improvements:

1. **Redis Cache**: For distributed caching in production
2. **CDN**: For static assets and images
3. **Database Connection Pooling**: Optimize Prisma connection pool
4. **Edge Functions**: Move some logic to edge for lower latency
5. **Incremental Static Regeneration (ISR)**: For more pages
6. **Service Worker**: For offline support and caching













