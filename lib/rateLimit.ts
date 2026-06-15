// Rate limiting.
//
// Prefers Upstash Redis (shared across all serverless instances) when
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set. Falls back to a
// per-instance in-memory limiter otherwise (and if Upstash is briefly
// unreachable), so the app keeps working in dev and before the creds are added.
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── In-memory fallback ─────────────────────────────────────────────────────────
const store = new Map<string, { count: number; resetAt: number }>();
const MAX_ENTRIES = 10_000;

/** Evict all expired entries when the store grows too large. */
function evictExpired(): void {
  if (store.size <= MAX_ENTRIES) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}

/**
 * Synchronous, per-instance limiter. Returns true if allowed, false if limited.
 * Used directly as the fallback; prefer the async `rateLimit()` in handlers.
 * @param key     Unique key, e.g. `"orders:1.2.3.4"`
 * @param limit   Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    evictExpired();
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

// ── Upstash (distributed) limiter ──────────────────────────────────────────────
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;

// One Ratelimit instance per (limit, window) combo, reused across requests.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${limit}:${windowSec}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "akratelimit",
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Uses Upstash when configured; otherwise (or on Upstash error) falls back to
 * the per-instance in-memory limiter.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!redis) return checkRateLimit(key, limit, windowMs);
  try {
    const { success } = await getLimiter(limit, windowMs).limit(key);
    return success;
  } catch {
    // Upstash unreachable — degrade gracefully to the in-memory limiter.
    return checkRateLimit(key, limit, windowMs);
  }
}

/** Extract the best available IP from Next.js request headers */
export function getIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

