import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://www.akautocare.pk",
  "https://akautocare.pk",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

export function checkCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null; // server-to-server calls — allow
  if (ALLOWED_ORIGINS.includes(origin)) return null;
  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}
