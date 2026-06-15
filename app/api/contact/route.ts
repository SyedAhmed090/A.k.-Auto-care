import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";
import { createAdminClient } from "@/utils/supabase/admin";

const RESEND_URL = "https://api.resend.com/emails";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit(`contact:${ip}`, 3, 10 * 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
    }
    const { name, email, subject, message } = parsed.data;

    // Persist the message so an inquiry is never lost if the email is missed.
    // Failure here must not block the user — log and continue to the email send.
    try {
      const sb = createAdminClient();
      const { error } = await sb.from("contact_messages").insert({ name, email, subject, message });
      if (error) throw error;
    } catch (err) {
      console.error("Contact message persist error:", err);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_EMAIL_FROM ?? "noreply@akautocare.pk";
    const to = process.env.CONTACT_EMAIL_TO ?? "hello@akautocare.pk";

    if (apiKey) {
      await fetch(RESEND_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          replyTo: email,
          subject: `[A.K. Auto Care Contact] ${subject}`,
          text: `From: ${name} <${email}>\n\n${message}`,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
