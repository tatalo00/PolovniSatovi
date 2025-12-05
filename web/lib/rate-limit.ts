import "server-only";

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  /** Default: 100 requests per 15 minutes */
  DEFAULT: { maxRequests: 100, windowMs: 15 * 60 * 1000 },
  /** Strict: 10 requests per minute (for sensitive endpoints) */
  STRICT: { maxRequests: 10, windowMs: 60 * 1000 },
  /** Auth: 5 requests per minute (for login/signup) */
  AUTH: { maxRequests: 5, windowMs: 60 * 1000 },
  /** Upload: 20 requests per hour */
  UPLOAD: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  /** Contact: 3 requests per hour */
  CONTACT: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
} as const;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limiter for development
 * Note: This won't work across serverless instances in production
 */
class InMemoryRateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Only set up cleanup in non-edge environments
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        Object.keys(this.store).forEach((key) => {
          if (this.store[key].resetTime < now) {
            delete this.store[key];
          }
        });
      }, 5 * 60 * 1000);
    }
  }

  async check(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || record.resetTime < now) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }
}

/**
 * Upstash Redis rate limiter for production
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 */
class UpstashRateLimiter {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  private async redis(command: string[]): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Redis error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async check(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);

    try {
      // Use sliding window with Redis INCR and EXPIRE
      const count = (await this.redis(["INCR", key])) as number;

      if (count === 1) {
        // First request in window, set expiry
        await this.redis(["EXPIRE", key, windowSeconds.toString()]);
      }

      // Get TTL for reset time calculation
      const ttl = (await this.redis(["TTL", key])) as number;
      const resetTime = now + ttl * 1000;

      if (count > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: ttl,
        };
      }

      return {
        allowed: true,
        remaining: maxRequests - count,
        resetTime,
      };
    } catch (error) {
      console.error("Rate limit Redis error:", error);
      // Fail open - allow request if Redis is unavailable
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + windowMs,
      };
    }
  }
}

/**
 * Get the appropriate rate limiter based on environment
 */
function createRateLimiter() {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    console.log("Using Upstash Redis rate limiter");
    return new UpstashRateLimiter(upstashUrl, upstashToken);
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ Using in-memory rate limiter in production. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed rate limiting."
    );
  }

  return new InMemoryRateLimiter();
}

// Singleton rate limiter instance
let rateLimiterInstance: InMemoryRateLimiter | UpstashRateLimiter | null = null;

function getRateLimiter() {
  if (!rateLimiterInstance) {
    rateLimiterInstance = createRateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Get identifier from request for rate limiting
 * Uses IP address from various headers
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  // If user is authenticated, use their ID for more accurate limiting
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers (works with most proxies/reverse proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  const vercelIp = request.headers.get("x-vercel-forwarded-for"); // Vercel

  const ip =
    vercelIp?.split(",")[0] ||
    cfConnectingIp ||
    forwarded?.split(",")[0] ||
    realIp ||
    "unknown";

  return `ip:${ip.trim()}`;
}

/**
 * Check rate limit for a request
 * @param request - The incoming request
 * @param config - Rate limit configuration (use RATE_LIMIT_CONFIG presets)
 * @param userId - Optional user ID for authenticated requests
 */
export async function checkRateLimit(
  request: Request,
  config: { maxRequests: number; windowMs: number } = RATE_LIMIT_CONFIG.DEFAULT,
  userId?: string
): Promise<RateLimitResult> {
  const identifier = getRateLimitIdentifier(request, userId);
  const limiter = getRateLimiter();
  return limiter.check(identifier, config.maxRequests, config.windowMs);
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.resetTime.toString());

  if (!result.allowed && result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }

  return headers;
}

/**
 * Rate limit middleware for API routes
 * @deprecated Use checkRateLimit instead for better async support
 */
export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  return async (request: Request): Promise<RateLimitResult> => {
    return checkRateLimit(request, { maxRequests, windowMs });
  };
}
