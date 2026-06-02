import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email().max(254) });

export async function POST(req: NextRequest) {
  // Rate limit: 3 signups per IP per hour
  const ip = getIP(req.headers);
  if (!checkRateLimit(`newsletter:${ip}`, 3, 60 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }

    // TODO: connect list provider (e.g. Klaviyo, Mailchimp, ConvertKit)
    // Set NEWSLETTER_API_KEY and NEWSLETTER_LIST_ID in .env.local
    console.log("[Newsletter signup]", parsed.data.email);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
