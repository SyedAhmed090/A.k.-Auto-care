import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const COOKIE = "ak_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* (not /api/admin/login itself)
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    // Admin not configured — block with 503
    return new NextResponse("Admin not configured.", { status: 503 });
  }

  const token = req.cookies.get(COOKIE)?.value;
  const expected = createHash("sha256").update(`ak-admin:${secret}`).digest("hex");

  if (token !== expected) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
