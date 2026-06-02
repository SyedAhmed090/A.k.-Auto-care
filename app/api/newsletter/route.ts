import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
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
