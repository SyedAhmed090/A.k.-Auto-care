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
 * Stateless auth check (no DB). Returns a 401 NextResponse if the request is
 * not authenticated, or null if auth passes. Used at the top of every admin
 * API route. Accepts both the legacy secret token and per-user tokens.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  let secret: string;
  try {
    secret = getAdminSecret();
  } catch {
    return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
  }

  const token = (await cookies()).get(COOKIE)?.value;
  const identity = await verifyToken(token, secret);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

/**
 * Returns the authenticated admin identity (or null), decoded statelessly from
 * the cookie. Use when a route needs to know *who* is acting (e.g. audit log).
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
 * Require an authenticated admin whose role is in `roles`. For per-user tokens
 * this re-checks the DB so disabled accounts and role changes take effect
 * immediately on protected routes (the legacy shared secret is always owner).
 * Returns { identity } on success, or { error } (a NextResponse) to return.
 */
export async function requireRole(
  roles: AdminRole[]
): Promise<{ identity: AdminIdentity; error: null } | { identity: null; error: NextResponse }> {
  const identity = await getAdminSession();
  if (!identity) {
    return { identity: null, error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  // Legacy shared-secret session is always treated as owner.
  if (identity.via === "secret") {
    if (!roles.includes("owner")) {
      return { identity: null, error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
    }
    return { identity, error: null };
  }

  // Per-user session — confirm the account is still active and read the live role.
  try {
    const sb = createAdminClient();
    const { data, error } = await (sb as any)
      .from("admin_users")
      .select("role, active")
      .eq("id", identity.uid)
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.active) {
      return { identity: null, error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
    }
    const liveRole = data.role as AdminRole;
    if (!roles.includes(liveRole)) {
      return { identity: null, error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
    }
    return { identity: { ...identity, role: liveRole }, error: null };
  } catch (err) {
    console.error("requireRole DB check failed:", err);
    return { identity: null, error: NextResponse.json({ error: "Server error." }, { status: 500 }) };
  }
}
