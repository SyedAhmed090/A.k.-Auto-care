import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";
import { createAdminClient } from "@/utils/supabase/admin";

const schema = z.object({ email: z.string().email().max(254) });

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit(`newsletter:${ip}`, 3, 60 * 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }

    const email = parsed.data.email;

    // Always save to Supabase (requires 004_newsletter.sql migration)
    try {
      const supabase = createAdminClient();
      await supabase
        .from("newsletter_subscribers")
        .upsert({ email }, { onConflict: "email" });
    } catch {
      // Non-fatal — table may not exist yet
    }

    // Forward to external provider if configured
    const apiKey = process.env.NEWSLETTER_API_KEY;
    const listId = process.env.NEWSLETTER_LIST_ID;
    if (apiKey && listId) {
      try {
        await fetch(`https://api.${apiKey.includes("klaviyo") ? "klaviyo.com" : "convertkit.com"}/v3/subscribers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, list_id: listId }),
        });
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
