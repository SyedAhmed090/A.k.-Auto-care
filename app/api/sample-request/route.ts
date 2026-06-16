import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";
import { createAdminClient } from "@/utils/supabase/admin";
import { MONTHLY_USAGE_OPTIONS } from "@/lib/sampleRequest";

const RESEND_URL = "https://api.resend.com/emails";

// Treat empty strings from optional inputs as "not provided".
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(max).optional()
  );

const schema = z.object({
  product_id: optionalText(64),
  product_name: z.string().min(1).max(200),
  product_slug: optionalText(200),
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(30),
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().email().max(254).optional()
  ),
  city: optionalText(100),
  address: optionalText(300),
  business_name: optionalText(150),
  monthly_usage: z.enum(MONTHLY_USAGE_OPTIONS),
});

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit(`sample:${ip}`, 5, 10 * 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
    }
    const d = parsed.data;

    // Persist the request so a lead is never lost if the email is missed.
    let samplePrice: number | null = null;
    try {
      const sb = createAdminClient();

      // Snapshot the sample price from the product server-side — never trust a
      // client-supplied price.
      if (d.product_id) {
        const { data: prod } = await sb
          .from("products")
          .select("sample_price")
          .eq("id", d.product_id)
          .maybeSingle();
        samplePrice = prod?.sample_price ?? null;
      }

      const { error } = await sb.from("sample_requests").insert({
        product_id: d.product_id ?? null,
        product_name: d.product_name,
        product_slug: d.product_slug ?? null,
        name: d.name,
        phone: d.phone,
        email: d.email ?? null,
        city: d.city ?? null,
        address: d.address ?? null,
        business_name: d.business_name ?? null,
        monthly_usage: d.monthly_usage,
        sample_price: samplePrice,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Sample request persist error:", err);
      return NextResponse.json({ ok: false, error: "Could not save your request. Please try again." }, { status: 500 });
    }

    // Best-effort notification email — failure must not block the user.
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_EMAIL_FROM ?? "noreply@akautocare.pk";
    const to = process.env.SAMPLE_EMAIL_TO ?? process.env.CONTACT_EMAIL_TO ?? "hello@akautocare.pk";

    if (apiKey) {
      try {
        const lines = [
          `Product: ${d.product_name}`,
          samplePrice != null ? `Sample price: Rs ${samplePrice.toLocaleString("en-PK")}` : `Sample price: (free / not set)`,
          `Estimated monthly usage: ${d.monthly_usage}`,
          ``,
          `Name: ${d.name}`,
          `Phone: ${d.phone}`,
          d.email ? `Email: ${d.email}` : null,
          d.business_name ? `Business: ${d.business_name}` : null,
          d.city ? `City: ${d.city}` : null,
          d.address ? `Address: ${d.address}` : null,
        ].filter(Boolean);

        await fetch(RESEND_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to,
            ...(d.email ? { replyTo: d.email } : {}),
            subject: `[A.K. Auto Care Sample Request] ${d.product_name}`,
            text: lines.join("\n"),
          }),
        });
      } catch (err) {
        console.error("Sample request email error:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
