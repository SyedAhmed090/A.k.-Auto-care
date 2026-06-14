// Simple in-memory rate limiter. Works per serverless instance — good enough
// for low-to-medium traffic. Replace with Upstash Redis if traffic scales.
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
 * Returns true if the request is allowed, false if rate-limited.
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

/** Extract the best available IP from Next.js request headers */
export function getIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
