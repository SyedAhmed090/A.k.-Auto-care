import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";
import { getTemplate, renderEmail, DEFAULT_TEMPLATES, type EmailTemplateKey } from "@/lib/email-templates";

const RESEND_URL = "https://api.resend.com/emails";
const VALID_KEYS = Object.keys(DEFAULT_TEMPLATES) as EmailTemplateKey[];

const bodySchema = z.object({
  key: z.enum(VALID_KEYS as [string, ...string[]]),
  to: z.string().email(),
  // Optional unsaved draft to preview before saving.
  subject: z.string().min(1).max(300).optional(),
  body: z.string().min(1).max(5000).optional(),
});

// Sample data used to fill {{variables}} in a test send.
const SAMPLE = {
  name: "Asad",
  order_id: "AK-12AB34CD",
  total: "Rs 4,999",
  tracking_number: "TRK123456789",
};

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email is not configured (RESEND_API_KEY missing)." }, { status: 503 });
  }

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { key, to, subject, body } = parsed.data;

    // Use the supplied draft if present, else the saved/default template.
    const saved = await getTemplate(key as EmailTemplateKey);
    const tpl = { subject: subject ?? saved.subject, body: body ?? saved.body };
    const rendered = renderEmail(tpl, { ...SAMPLE, status: key.replace(/^status_/, "") });

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_EMAIL_FROM ?? "orders@akautocare.pk",
        to,
        subject: `[TEST] ${rendered.subject}`,
        html: rendered.html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Email test send failed:", res.status, detail);
      return NextResponse.json({ error: "Send failed. Check the from-address domain in Resend." }, { status: 502 });
    }

    return NextResponse.json({ sent: true, to });
  } catch (err) {
    console.error("Admin email-templates test error:", err);
    return NextResponse.json({ error: "Failed to send test email." }, { status: 500 });
  }
}
