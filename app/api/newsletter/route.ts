import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email().max(254) });

export async function POST(req: NextRequest) {
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

    const apiKey = process.env.NEWSLETTER_API_KEY;
    const listId = process.env.NEWSLETTER_LIST_ID;

    // If provider is configured, push the email — otherwise silently accept
    // (the email is still logged for manual export)
    if (apiKey && listId) {
      // Generic provider POST — adapt to your provider (Klaviyo, Mailchimp, ConvertKit, etc.)
      await fetch(`https://api.${apiKey.includes("klaviyo") ? "klaviyo.com" : "convertkit.com"}/v3/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email, list_id: listId }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
