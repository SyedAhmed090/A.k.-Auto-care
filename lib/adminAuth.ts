import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  legacyToken,
  signUserToken,
  verifyToken,
  utcDay,
  type AdminIdentity,
  type AdminRole,
} from "@/lib/adminToken";

const COOKIE = "ak_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export type { AdminIdentity, AdminRole };

export function getAdminSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET env var not set");
  return s;
}

/** Legacy shared-secret owner token (still issued for ADMIN_SECRET logins). */
export async function makeToken(secret: string): Promise<string> {
  return legacyToken(secret, utcDay());
}

/** Signed per-user session token. */
export async function makeUserToken(user: { uid: string; role: AdminRole }, secret: string): Promise<string> {
  return signUserToken(user, secret, utcDay());
}

export function cookieName(): string {
  return COOKIE;
}

export function cookieMaxAge(): number {
  return MAX_AGE;
}

/**
 * Decodes the cookie statelessly into an identity (or null). Use only when you
 * just need *who* is acting for labelling (e.g. audit log) and a freshness check
 * is unnecessary. For access control use requireAdmin / requireRole, which
 * verify the account is still active.
 */
export async function getAdminSession(): Promise<AdminIdentity | null> {
  let secret: string;
  try {
    secret = getAdminSecret();
  } catch {
    return null;
  }
  const token = (await cookies()).get(COOKIE)?.value;
  return verifyToken(token, secret);
}

/**
 * Resolves the *active* admin identity for access control. For per-user tokens
 * this re-checks `admin_users` so a disabled or role-changed account loses
 * access immediately (rather than at token expiry). The legacy shared secret is
 * always owner. Fails closed (returns null) on any DB error. Returns null if
 * unauthenticated or inactive.
 */
async function activeIdentity(): Promise<AdminIdentity | null> {
  const identity = await getAdminSession();
  if (!identity) return null;

  // Legacy shared-secret session is always a valid owner — no DB lookup needed.
  if (identity.via === "secret") return identity;

  try {
    const sb = createAdminClient();
    const { data, error } = await (sb as any)
      .from("admin_users")
      .select("role, active")
      .eq("id", identity.uid)
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.active) return null;
    return { ...identity, role: data.role as AdminRole };
  } catch (err) {
    console.error("activeIdentity DB check failed:", err);
    return null; // fail closed
  }
}

/**
 * Auth gate for admin API routes: requires an authenticated, still-active admin
 * (any role). Returns a 401/503 NextResponse to return, or null if auth passes.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    getAdminSecret();
  } catch {
    return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
  }

  const identity = await activeIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

/**
 * Require an authenticated, active admin whose live role is in `roles`.
 * Returns { identity } on success, or { error } (a NextResponse) to return.
 */
export async function requireRole(
  roles: AdminRole[]
): Promise<{ identity: AdminIdentity; error: null } | { identity: null; error: NextResponse }> {
  const identity = await activeIdentity();
  if (!identity) {
    return { identity: null, error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  if (!roles.includes(identity.role)) {
    return { identity: null, error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { identity, error: null };
}
