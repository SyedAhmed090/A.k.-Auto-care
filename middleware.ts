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

  const token = req.cookies.get(COOKIE)?.value;
  const expected = await sha256Hex(`ak-admin:${secret}`);

  if (token !== expected) {
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
