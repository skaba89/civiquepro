/**
 * In-memory rate limiter for Next.js serverless functions.
 *
 * Use cases:
 *   - Protect /api/auth/callback/credentials from brute-force
 *   - Protect /api/auth/register from spam
 *   - Protect /api/user/update-password from automated abuse
 *
 * Limitations:
 *   - Per-instance only (won't work across multiple Render instances)
 *   - For multi-instance deployments, use Upstash Redis ratelimiter
 *     (see https://upstash.com/docs/redis/sdks/ratelimit-ts)
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rate-limit";
 *
 *   const result = rateLimit({
 *     key: `login:${ip}:${email}`,
 *     limit: 5,
 *     windowMs: 60_000, // 1 minute
 *   });
 *   if (!result.success) {
 *     return NextResponse.json(
 *       { error: "Trop de tentatives. Réessayez dans " + Math.ceil(result.retryAfter / 1000) + "s." },
 *       { status: 429, headers: { "Retry-After": String(Math.ceil(result.retryAfter / 1000)) } }
 *     );
 *   }
 */

interface RateBucket {
  count: number;
  resetAt: number;
}

// Simple Map-based store — entries are garbage-collected lazily on access
const store = new Map<string, RateBucket>();

// Periodic cleanup every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitOptions {
  /** Unique key per limiter (e.g. `login:${ip}:${email}`) */
  key: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Milliseconds until the bucket resets (if limited) */
  retryAfter: number;
  /** Remaining requests in current window */
  remaining: number;
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, limit, windowMs } = options;
  const now = Date.now();

  let bucket = store.get(key);

  // Reset bucket if window expired
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfter = Math.max(0, bucket.resetAt - now);

  if (bucket.count > limit) {
    return { success: false, retryAfter, remaining: 0 };
  }

  return { success: true, retryAfter, remaining };
}

/**
 * Extract client IP from a Next.js request.
 * Handles x-forwarded-for, x-real-ip, and falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}
