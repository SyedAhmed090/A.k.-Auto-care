import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/adminAuth";
import { sanitizeSearchTerm } from "@/lib/utils";

// A-03: Date param validator — must be YYYY-MM-DD.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(v: string | null): boolean {
  return v !== null && DATE_RE.test(v) && !isNaN(new Date(v).getTime());
}

interface ExportOrderItem { productName: string; quantity: number; }

export async function GET(req: NextRequest) {
  // Bulk customer PII export — restrict to owner/manager.
  const { error: authError } = await requireRole(["owner", "manager"]);
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const status  = searchParams.get("status");
    const search  = searchParams.get("search")?.trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo   = searchParams.get("dateTo");

    // A-03: Reject malformed date params before passing to PostgREST.
    if (dateFrom && !isValidDate(dateFrom)) {
      return NextResponse.json({ error: "Invalid dateFrom parameter." }, { status: 400 });
    }
    if (dateTo && !isValidDate(dateTo)) {
      return NextResponse.json({ error: "Invalid dateTo parameter." }, { status: 400 });
    }

    const supabase = createAdminClient();
    // A-02: Narrow columns to only what the CSV uses, and cap at 50 000 rows to
    // bound memory/egress on large exports.
    let query = supabase
      .from("orders")
      .select("id, created_at, first_name, last_name, email, phone, city, items, subtotal, discount, promo_code, shipping, total, payment_method, shipping_method, status, tracking_number")
      .order("created_at", { ascending: false })
      .limit(50_000);

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      const s = sanitizeSearchTerm(search);
      if (s) query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
    }
    if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
    if (dateTo)   query = query.lte("created_at", `${dateTo}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    const orders = data ?? [];
    const esc = (v: unknown) => { const s = String(v ?? ''); const safe = /^[=+\-@|\t\r]/.test(s) ? "'" + s : s; return '"' + safe.replace(/"/g, '""') + '"'; };

    const cols = ["Order ID","Date","Name","Email","Phone","City","Items","Subtotal","Discount","Promo","Shipping","Total","Payment","Shipping Method","Status","Tracking"];
    const rows = orders.map(o => [
      `AK-${o.id.slice(0, 8).toUpperCase()}`,
      new Date(o.created_at ?? "").toLocaleDateString("en-PK"),
      `${o.first_name} ${o.last_name}`,
      o.email,
      o.phone ?? "",
      o.city,
      (o.items as unknown as ExportOrderItem[]).map(i => `${i.productName} x${i.quantity}`).join("; "),
      o.subtotal,
      o.discount,
      o.promo_code ?? "",
      o.shipping,
      o.total,
      o.payment_method,
      o.shipping_method ?? "",
      o.status,
      o.tracking_number ?? "",
    ].map(esc).join(","));

    const csv = [cols.map(esc).join(","), ...rows].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ak-orders-${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
