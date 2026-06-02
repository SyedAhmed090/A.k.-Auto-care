import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
    }
    const { name, email, subject, message } = parsed.data;

    // TODO: connect transactional email provider (e.g. Resend, SendGrid)
    // Set CONTACT_EMAIL_FROM and CONTACT_EMAIL_TO in .env.local
    // Example with Resend:
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({ from: process.env.CONTACT_EMAIL_FROM, to: process.env.CONTACT_EMAIL_TO, subject, ... });
    console.log("[Contact form]", { name, email, subject, message });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
