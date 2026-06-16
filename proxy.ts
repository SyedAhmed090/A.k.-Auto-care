import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/adminToken";

const COOKIE = "ak_admin_session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login/logout endpoints through without auth
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/logout") return NextResponse.next();

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    // Admin not configured — block with 503
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
    }
    return new NextResponse("Admin not configured.", { status: 503 });
  }

  // Accepts the legacy shared-secret token and per-user (v2) tokens alike.
  const token = req.cookies.get(COOKIE)?.value;
  const identity = await verifyToken(token, secret);

  if (!identity) {
    // API routes get a JSON 401; page routes get redirected to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
