import { NextRequest, NextResponse } from "next/server";
import { cookieName } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName(), "", { maxAge: 0, path: "/" });
  return res;
}
