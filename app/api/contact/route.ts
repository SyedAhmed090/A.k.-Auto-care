import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  // Rate limit: 3 contact submissions per IP per 10 minutes
  const ip = getIP(req.headers);
  if (!checkRateLimit(`contact:${ip}`, 3, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
    }
    const { name, email, subject, message } = parsed.data;

    // TODO: connect transactional email provider (e.g. Resend)
    // Set RESEND_API_KEY, CONTACT_EMAIL_FROM, CONTACT_EMAIL_TO in .env.local
    // Example:
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: process.env.CONTACT_EMAIL_FROM!,
    //     to: process.env.CONTACT_EMAIL_TO!,
    //     subject: `[A.K. Auto Care] ${subject}`,
    //     text: `From: ${name} <${email}>\n\n${message}`,
    //   });
    console.log("[Contact form]", { name, email, subject, message });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
