import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { makeToken, cookieName, cookieMaxAge, getAdminSecret } from "@/lib/adminAuth";
import { checkRateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const ip = getIP(req.headers);
    if (!checkRateLimit("admin-login:" + ip, 5, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
    }

    const { password } = await req.json();
    const secret = getAdminSecret();

    const a = Buffer.from(password ?? "");
    const b = Buffer.from(secret);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = await makeToken(secret);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: cookieMaxAge(),
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
