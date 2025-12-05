import "server-only";

import { NextResponse } from "next/server";

/**
 * Cache control presets for API responses
 */
export const CACHE_CONTROL = {
  /** No caching - for user-specific or sensitive data */
  NONE: "no-store, no-cache, must-revalidate",
  /** Private cache - for authenticated user data (browser only) */
  PRIVATE: "private, max-age=60, stale-while-revalidate=120",
  /** Short public cache - for frequently changing data (5 min) */
  SHORT: "public, s-maxage=300, stale-while-revalidate=600",
  /** Medium public cache - for moderately changing data (15 min) */
  MEDIUM: "public, s-maxage=900, stale-while-revalidate=1800",
  /** Long public cache - for rarely changing data (1 hour) */
  LONG: "public, s-maxage=3600, stale-while-revalidate=7200",
  /** Static cache - for very stable data (24 hours) */
  STATIC: "public, s-maxage=86400, stale-while-revalidate=172800",
} as const;

/**
 * Add cache headers to a NextResponse
 */
export function withCacheHeaders<T>(
  response: NextResponse<T>,
  cacheControl: string = CACHE_CONTROL.SHORT
): NextResponse<T> {
  response.headers.set("Cache-Control", cacheControl);
  return response;
}

/**
 * Create a JSON response with cache headers
 */
export function jsonWithCache<T>(
  data: T,
  options: {
    status?: number;
    cache?: string;
    headers?: HeadersInit;
  } = {}
): NextResponse<T> {
  const { status = 200, cache = CACHE_CONTROL.SHORT, headers = {} } = options;

  const response = NextResponse.json(data, { status, headers });
  response.headers.set("Cache-Control", cache);

  return response;
}

/**
 * Create an error response (no caching)
 */
export function errorResponse(
  message: string,
  status: number = 500
): NextResponse<{ error: string }> {
  const response = NextResponse.json({ error: message }, { status });
  response.headers.set("Cache-Control", CACHE_CONTROL.NONE);
  return response;
}

/**
 * Standard API response wrapper with timing
 */
export async function withApiHandler<T>(
  handler: () => Promise<T>,
  options: {
    cache?: string;
    onError?: (error: unknown) => { message: string; status: number };
  } = {}
): Promise<NextResponse> {
  const { cache = CACHE_CONTROL.NONE, onError } = options;

  try {
    const data = await handler();
    return jsonWithCache(data, { cache });
  } catch (error) {
    if (onError) {
      const { message, status } = onError(error);
      return errorResponse(message, status);
    }

    const message =
      error instanceof Error ? error.message : "Došlo je do greške";
    return errorResponse(message, 500);
  }
}
