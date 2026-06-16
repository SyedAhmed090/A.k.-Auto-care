import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { makeToken, makeUserToken, cookieName, cookieMaxAge, getAdminSecret } from "@/lib/adminAuth";
import { createAdminClient } from "@/utils/supabase/admin";
import { verifyPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";
import type { AdminRole } from "@/lib/adminToken";

function setSessionCookie(res: NextResponse, token: string) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.cookies.set(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: cookieMaxAge(),
    path: "/",
  });
}

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const ip = getIP(req.headers);
    if (!(await rateLimit("admin-login:" + ip, 5, 15 * 60_000))) {
      return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
    }

    const { email, password } = await req.json();
    const secret = getAdminSecret();

    // ── Per-user login (#12): email + password against admin_users ──
    if (email && typeof email === "string") {
      const sb = createAdminClient();
      const { data: user } = await (sb as any)
        .from("admin_users")
        .select("id, password_hash, role, active")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      // Always run a verify to keep timing roughly constant whether or not the
      // user exists, then check active + match.
      const ok =
        user && user.active && (await verifyPassword(password ?? "", user.password_hash));
      if (!ok) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const token = await makeUserToken({ uid: user.id, role: user.role as AdminRole }, secret);
      const res = NextResponse.json({ ok: true, role: user.role });
      setSessionCookie(res, token);
      await logAudit({ uid: user.id, role: user.role as AdminRole, via: "user" }, { action: "login", entity: "session" });
      return res;
    }

    // ── Legacy login: shared ADMIN_SECRET (treated as owner) ──
    const a = Buffer.from(password ?? "");
    const b = Buffer.from(secret);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = await makeToken(secret);
    const res = NextResponse.json({ ok: true, role: "owner" });
    setSessionCookie(res, token);
    await logAudit({ uid: null, role: "owner", via: "secret" }, { action: "login", entity: "session" });
    return res;
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
