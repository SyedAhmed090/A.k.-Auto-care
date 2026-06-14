import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://www.akautocare.pk",
  "https://akautocare.pk",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

export function checkCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  // Require an explicit Origin header — reject requests with no Origin (curl, scripts, etc.)
  if (!origin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  // Explicit production origins.
  if (ALLOWED_ORIGINS.includes(origin)) return null;

  // Allow same-origin requests: the Origin's host must match the request Host.
  // Covers Vercel preview URLs (*.vercel.app), any custom domain, and localhost,
  // while still rejecting genuine cross-site requests.
  try {
    const host = req.headers.get("host");
    if (host && new URL(origin).host === host) return null;
  } catch {
    // malformed Origin — fall through to reject
  }

  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}
