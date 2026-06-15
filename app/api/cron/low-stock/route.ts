import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSettings } from "@/lib/settings";
import { buildLowStockHtml } from "@/lib/low-stock-email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { inventory } = await getSettings();
  const threshold = inventory.lowStockThreshold;

  // Tracked products (stock is not null) at or under the threshold, or flagged
  // out of stock. Untracked products (stock = null = "∞") are ignored.
  const { data, error } = await supabase
    .from("products")
    .select("name, slug, stock, in_stock")
    .not("stock", "is", null)
    .lte("stock", threshold)
    .order("stock", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to query products." }, { status: 500 });
  }

  const products = data ?? [];
  if (products.length === 0) {
    return NextResponse.json({ count: 0, sent: false });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM ?? "noreply@akautocare.pk";
  const to = process.env.LOW_STOCK_EMAIL_TO ?? process.env.CONTACT_EMAIL_TO ?? "hello@akautocare.pk";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://akautocare.pk";

  let sent = false;
  if (apiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from,
          to,
          subject: `Low stock: ${products.length} product${products.length === 1 ? "" : "s"} need attention`,
          html: buildLowStockHtml({ products, threshold, siteUrl }),
        }),
      });
      sent = true;
    } catch {
      // Non-fatal — report the count even if the email send failed.
    }
  }

  return NextResponse.json({ count: products.length, sent });
}
