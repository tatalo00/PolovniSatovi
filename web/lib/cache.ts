import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { cache } from "react";

/**
 * Cache life presets for the "use cache" directive (Next.js 16+)
 * Import cacheLife and cacheTag from 'next/cache' inside your function
 *
 * @example
 * import { cacheLife, cacheTag } from "next/cache";
 *
 * async function getData() {
 *   "use cache";
 *   cacheLife("minutes"); // Use Next.js preset
 *   cacheTag("listings");
 *   return await db.query();
 * }
 *
 * Available presets: "seconds", "minutes", "hours", "days", "weeks", "max"
 */
export const CACHE_PRESETS = {
  /** Real-time data - use "seconds" preset */
  instant: "seconds",
  /** User-specific data - use "minutes" preset */
  short: "minutes",
  /** Listings data - use "hours" preset */
  medium: "hours",
  /** Reference data - use "days" preset */
  long: "days",
  /** Static content - use "weeks" preset */
  static: "weeks",
} as const;

/**
 * Revalidate a cache tag - use to invalidate cached data
 * @example
 * import { invalidateTag } from "@/lib/cache";
 * invalidateTag("listings");
 */
export const invalidateTag = revalidateTag;

/**
 * Cache configuration for different data types
 */
export const CACHE_TAGS = {
  listings: "listings",
  listing: (id: string) => `listing-${id}`,
  brands: "brands",
  user: (id: string) => `user-${id}`,
  favorites: (id: string) => `favorites-${id}`,
  sellers: "sellers",
  seller: (id: string) => `seller-${id}`,
  reviews: "reviews",
  stats: "stats",
} as const;

/**
 * Revalidation times in seconds
 * Tiered caching strategy for different data freshness requirements
 */
export const REVALIDATE = {
  /** Real-time data that needs frequent updates (30 seconds) */
  INSTANT: 30,
  /** User-specific or frequently changing data (1 minute) */
  SHORT: 60,
  /** Listings and moderately changing data (5 minutes) */
  MEDIUM: 300,
  /** Brands, categories, and rarely changing data (1 hour) */
  LONG: 3600,
  /** Static content like blog posts, about pages (24 hours) */
  STATIC: 86400,
} as const;

/**
 * Create a cached function with automatic revalidation
 * @param fn - The async function to cache
 * @param options - Cache configuration options
 * @returns Cached version of the function
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    key: string | string[];
    tags?: string[];
    revalidate?: number;
  }
): T {
  return unstable_cache(
    fn,
    typeof options.key === "string" ? [options.key] : options.key,
    {
      tags: options.tags,
      revalidate: options.revalidate ?? REVALIDATE.MEDIUM,
    }
  ) as T;
}

/**
 * React cache wrapper for request-level memoization
 * This prevents duplicate queries within the same request
 */
export const requestCache = cache;

/**
 * Helper to generate cache keys with parameters
 * @param base - Base key name
 * @param params - Parameters to include in the key
 * @returns Array of cache key segments
 */
export function generateCacheKey(base: string, params?: Record<string, unknown>): string[] {
  if (!params) return [base];
  
  const sortedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join(",");
  
  return sortedParams ? [base, sortedParams] : [base];
}
