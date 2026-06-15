import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";
import { gstAmount } from "@/lib/commerce";

// ── Sales / GST report ─────────────────────────────────────────────────────────
// Aggregates non-cancelled / non-refunded orders into per-period rows + an overall
// total. Periods are grouped by calendar day or month (UTC, from `created_at`).
//
// FORMULAS (per row and for totals — all sums over the orders in that bucket):
//   gross    = Σ order.total                 (GST-INCLUSIVE amount actually charged)
//   discount = Σ order.discount
//   shipping = Σ order.shipping
//   gst      = Σ gstAmount(order.total, gstRate)
//                = Σ total * (gstRate / (1 + gstRate))   ← GST portion of an inclusive total
//   net      = gross - gst                    (ex-GST revenue, GST-exclusive)
//   orders   = count of orders in the bucket
// Prices in this store are GST-inclusive (settings.tax.gstInclusive), so GST is
// EXTRACTED from `total` rather than added on top.

// Statuses that represent non-revenue orders and must be excluded from sales figures.
const EXCLUDED_STATUSES = ["cancelled", "refunded"];

type Period = "day" | "month";

interface SalesRow {
  period: string;   // "YYYY-MM-DD" (day) or "YYYY-MM" (month)
  gross: number;
  discount: number;
  shipping: number;
  gst: number;
  net: number;
  orders: number;
}

type Totals = Omit<SalesRow, "period">;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** CSV cell escaping — mirrors app/api/admin/orders/export/route.ts exactly. */
const esc = (v: unknown) => {
  const s = String(v ?? "");
  const safe = /^[=+\-@|\t\r]/.test(s) ? "'" + s : s;
  return '"' + safe.replace(/"/g, '""') + '"';
};

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const groupBy: Period = searchParams.get("groupBy") === "month" ? "month" : "day";
    const format = searchParams.get("format");

    const settings = await getSettings();
    const gstRate = settings.tax.gstRate;

    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select("total, discount, shipping, status, created_at")
      .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`)
      .order("created_at", { ascending: true });

    if (from) query = query.gte("created_at", `${from}T00:00:00`);
    if (to) query = query.lte("created_at", `${to}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    const orders = data ?? [];

    // Bucket orders by period key and accumulate.
    const buckets = new Map<string, SalesRow>();
    const totals: Totals = { gross: 0, discount: 0, shipping: 0, gst: 0, net: 0, orders: 0 };

    for (const o of orders) {
      const iso = (o.created_at ?? "").slice(0, 10); // YYYY-MM-DD
      if (!iso) continue;
      const key = groupBy === "month" ? iso.slice(0, 7) : iso; // YYYY-MM or YYYY-MM-DD

      const gross = Number(o.total) || 0;
      const discount = Number(o.discount) || 0;
      const shipping = Number(o.shipping) || 0;
      const gst = gstAmount(gross, gstRate);
      const net = gross - gst;

      const row = buckets.get(key) ?? { period: key, gross: 0, discount: 0, shipping: 0, gst: 0, net: 0, orders: 0 };
      row.gross += gross;
      row.discount += discount;
      row.shipping += shipping;
      row.gst += gst;
      row.net += net;
      row.orders += 1;
      buckets.set(key, row);

      totals.gross += gross;
      totals.discount += discount;
      totals.shipping += shipping;
      totals.gst += gst;
      totals.net += net;
      totals.orders += 1;
    }

    const rows: SalesRow[] = Array.from(buckets.values())
      .map((r) => ({
        period: r.period,
        gross: round2(r.gross),
        discount: round2(r.discount),
        shipping: round2(r.shipping),
        gst: round2(r.gst),
        net: round2(r.net),
        orders: r.orders,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const totalsOut: Totals = {
      gross: round2(totals.gross),
      discount: round2(totals.discount),
      shipping: round2(totals.shipping),
      gst: round2(totals.gst),
      net: round2(totals.net),
      orders: totals.orders,
    };

    if (format === "csv") {
      const cols = ["Period", "Orders", "Gross (incl. GST)", "Discounts", "Shipping", `GST (${Math.round(gstRate * 100)}%)`, "Net (ex-GST)"];
      const body = rows.map((r) => [r.period, r.orders, r.gross, r.discount, r.shipping, r.gst, r.net].map(esc).join(","));
      const totalLine = ["TOTAL", totalsOut.orders, totalsOut.gross, totalsOut.discount, totalsOut.shipping, totalsOut.gst, totalsOut.net].map(esc).join(",");
      const csv = [cols.map(esc).join(","), ...body, totalLine].join("\n");
      const date = new Date().toISOString().slice(0, 10);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ak-sales-${date}.csv"`,
        },
      });
    }

    return NextResponse.json({ rows, totals: totalsOut, gstRate, groupBy });
  } catch {
    return NextResponse.json({ error: "Report failed." }, { status: 500 });
  }
}
