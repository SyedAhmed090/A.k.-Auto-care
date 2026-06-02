import { NextRequest, NextResponse } from "next/server";
import { makeToken, cookieName, cookieMaxAge, getAdminSecret } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const secret = getAdminSecret();

    if (!password || password !== secret) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = makeToken(secret);
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
