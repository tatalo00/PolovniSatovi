import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * Cache configuration for different data types
 */
export const CACHE_TAGS = {
  listings: "listings",
  listing: (id: string) => `listing-${id}`,
  brands: "brands",
  user: (id: string) => `user-${id}`,
  favorites: (id: string) => `favorites-${id}`,
} as const;

/**
 * Revalidation times in seconds
 */
export const REVALIDATE = {
  // Short cache for frequently changing data
  SHORT: 60, // 1 minute
  // Medium cache for moderately changing data
  MEDIUM: 300, // 5 minutes
  // Long cache for rarely changing data
  LONG: 3600, // 1 hour
  // Very long cache for static data
  VERY_LONG: 86400, // 24 hours
} as const;

/**
 * Create a cached function with automatic revalidation
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
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


