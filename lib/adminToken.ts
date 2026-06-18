// Edge-safe admin session token logic (Web Crypto only — NO next/headers, NO
// node:crypto), so it can be imported by both middleware.ts (Edge runtime) and
// lib/adminAuth.ts (Node route handlers).
//
// Two token shapes are accepted, both scoped to the current UTC day so sessions
// expire at midnight regardless of cookie maxAge:
//   1. Legacy owner token  — sha256("ak-admin:<secret>:<day>"). Backward compatible
//      with the single shared ADMIN_SECRET login, treated as role "owner".
//   2. Per-user token (v2) — "v2.<payloadB64url>.<hmacHex>" where payload is
//      {uid, role, day}, signed with HMAC-SHA256 keyed by ADMIN_SECRET.
//
// Verifying only needs ADMIN_SECRET, so no sessions table / DB read is required
// on the hot path. Role/active freshness is re-checked from the DB in the
// sensitive route handlers (see lib/adminAuth.getAdminSession).

export type AdminRole = "owner" | "manager" | "staff";

export type AdminIdentity = {
  uid: string | null; // null for the legacy shared-secret owner
  role: AdminRole;
  via: "secret" | "user";
};

export function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return hex(new Uint8Array(buf));
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function b64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

// Constant-time-ish hex comparison.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return hex(new Uint8Array(sig));
}

// Module-level caches — tokens are day-scoped so stale entries are never matched;
// we just cap size to prevent multi-day accumulation from growing unbounded.
const legacyCache = new Map<string, string>(); // "<day>:<secret>" -> hash
const hmacCache   = new Map<string, string>(); // "<payload>:<secret>" -> hex signature

function evictIfNeeded<K>(map: Map<K, string>, max: number) {
  if (map.size <= max) return;
  const toDelete = [...map.keys()].slice(0, Math.floor(max / 2));
  for (const k of toDelete) map.delete(k);
}

/** Legacy shared-secret owner token for the current day. */
export async function legacyToken(secret: string, day: string = utcDay()): Promise<string> {
  const key = `${day}:${secret}`;
  const hit = legacyCache.get(key);
  if (hit) return hit;
  const token = await sha256Hex(`ak-admin:${secret}:${day}`);
  evictIfNeeded(legacyCache, 32);
  legacyCache.set(key, token);
  return token;
}

/** Build a signed per-user (v2) token for the current day. */
export async function signUserToken(
  user: { uid: string; role: AdminRole },
  secret: string,
  day: string = utcDay()
): Promise<string> {
  const payload = b64urlEncode(JSON.stringify({ uid: user.uid, role: user.role, day }));
  const sig = await hmacHex(payload, secret);
  return `v2.${payload}.${sig}`;
}

/** Verify a cookie token against the secret. Returns identity or null. */
export async function verifyToken(token: string | undefined, secret: string): Promise<AdminIdentity | null> {
  if (!token) return null;
  const day = utcDay();

  // 1. Legacy owner token.
  const legacy = await legacyToken(secret, day);
  if (safeEqual(token, legacy)) return { uid: null, role: "owner", via: "secret" };

  // 2. Per-user signed token.
  if (token.startsWith("v2.")) {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [, payload, sig] = parts;
    const hmacKey = `${payload}:${secret}`;
    let expected = hmacCache.get(hmacKey);
    if (!expected) {
      expected = await hmacHex(payload, secret);
      evictIfNeeded(hmacCache, 500);
      hmacCache.set(hmacKey, expected);
    }
    if (!safeEqual(sig, expected)) return null;
    try {
      const data = JSON.parse(b64urlDecode(payload)) as { uid?: string; role?: string; day?: string };
      if (data.day !== day) return null; // expired (different UTC day)
      if (!data.uid || (data.role !== "owner" && data.role !== "manager" && data.role !== "staff")) return null;
      return { uid: data.uid, role: data.role, via: "user" };
    } catch {
      return null;
    }
  }

  return null;
}
