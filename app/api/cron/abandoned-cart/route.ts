import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { buildAbandonedCartHtml } from "@/lib/abandoned-cart-email";

// S-14: Use constant-time comparison to prevent timing oracle on CRON_SECRET.
function verifyCronSecret(authHeader: string | null, secret: string): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const provided = authHeader.slice("Bearer ".length);
  const expectedBuf = Buffer.from(secret, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

function mintCartToken(id: string, exp: number): string {
  const secret = process.env.CART_RECOVERY_SECRET ?? "";
  const payloadB64 = Buffer.from(JSON.stringify({ id, exp })).toString("base64url");
  const sig = createHmac("sha256", secret)
    .update(`${id}:${exp}`)
    .digest("hex");
  return `${payloadB64}.${sig}`;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !verifyCronSecret(req.headers.get("authorization"), cronSecret)) {
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

  // D-14: Process email sends in parallel, then batch the DB update.
  // Old code made N sequential await calls (one DB write per cart); new code
  // collects successfully-sent IDs and updates them in a single .in() query.
  const sentIds: string[] = [];

  await Promise.all(
    (carts ?? []).map(async (cart) => {
      const exp = Date.now() + 48 * 3600 * 1000;
      const token = mintCartToken(cart.id, exp);
      const recoveryUrl = `${siteUrl}/cart?recover=${token}`;

      const cartItems = (Array.isArray(cart.cart_data) ? cart.cart_data : []) as unknown as Parameters<typeof buildAbandonedCartHtml>[0]['cartItems'];

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
          sentIds.push(cart.id);
        } catch {
          // Non-fatal — skip this cart
        }
      } else {
        // No email API key — still mark as "sent" to avoid reprocessing
        sentIds.push(cart.id);
      }
    })
  );

  // Batch update: single DB round-trip instead of N sequential writes
  if (sentIds.length > 0) {
    await supabase
      .from("abandoned_carts")
      .update({ email_sent_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  return NextResponse.json({ sent: sentIds.length });
}
