import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "ak_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function getAdminSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET env var not set");
  return s;
}

export async function makeToken(secret: string): Promise<string> {
  // Include UTC date so tokens expire at midnight daily regardless of cookie maxAge
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`ak-admin:${secret}:${day}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function cookieName(): string {
  return COOKIE;
}

export function cookieMaxAge(): number {
  return MAX_AGE;
}

/**
 * Call at the top of every admin API route handler.
 * Returns a 401 NextResponse if the request is not authenticated, or null if auth passes.
 *
 * Usage:
 *   const authError = await requireAdmin();
 *   if (authError) return authError;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  let secret: string;
  try {
    secret = getAdminSecret();
  } catch {
    return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
  }

  const token = (await cookies()).get(COOKIE)?.value;
  const expected = await makeToken(secret);

  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
