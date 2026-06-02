const COOKIE = "ak_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function getAdminSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET env var not set");
  return s;
}

export async function makeToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`ak-admin:${secret}`);
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
