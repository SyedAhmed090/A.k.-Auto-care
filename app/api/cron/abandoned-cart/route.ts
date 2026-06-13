import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { buildAbandonedCartHtml } from "@/lib/abandoned-cart-email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: carts, error } = await supabase
    .from("abandoned_carts")
    .select("id, email, cart_data")
    .neq("email", "")
    .is("email_sent_at", null)
    .is("recovered_at", null)
    .lt("updated_at", new Date(Date.now() - 3600 * 1000).toISOString())
    .neq("cart_data", "[]")
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to query carts." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://akautocare.pk";
  const from = process.env.CONTACT_EMAIL_FROM ?? "noreply@akautocare.pk";
  const apiKey = process.env.RESEND_API_KEY;
  let sent = 0;

  for (const cart of carts ?? []) {
    const token = Buffer.from(
      JSON.stringify({ id: cart.id, exp: Date.now() + 48 * 3600 * 1000 })
    ).toString("base64url");
    const recoveryUrl = `${siteUrl}/cart?recover=${token}`;

    const cartItems = Array.isArray(cart.cart_data) ? cart.cart_data : [];

    if (apiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: cart.email,
            subject: "You left something behind...",
            html: buildAbandonedCartHtml({
              email: cart.email,
              cartItems,
              recoveryUrl,
            }),
          }),
        });
      } catch {
        continue;
      }
    }

    await supabase
      .from("abandoned_carts")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", cart.id);

    sent++;
  }

  return NextResponse.json({ sent });
}
