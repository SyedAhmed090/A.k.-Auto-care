import { createHash } from "crypto";

const COOKIE = "ak_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function getAdminSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET env var not set");
  return s;
}

export function makeToken(secret: string): string {
  return createHash("sha256").update(`ak-admin:${secret}`).digest("hex");
}

export function cookieName(): string {
  return COOKIE;
}

export function cookieMaxAge(): number {
  return MAX_AGE;
}
