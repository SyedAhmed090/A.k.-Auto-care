import { NextRequest, NextResponse } from "next/server";

const COOKIE = "ak_admin_session";

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
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
  const expected = await sha256Hex(`ak-admin:${secret}`);

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
