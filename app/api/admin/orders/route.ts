import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { sanitizeSearchTerm } from "@/lib/utils";

// A-03: Date param validator — must be YYYY-MM-DD.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(v: string | null): boolean {
  return v !== null && DATE_RE.test(v) && !isNaN(new Date(v).getTime());
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const status  = searchParams.get("status");
    const search  = searchParams.get("search")?.trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo   = searchParams.get("dateTo");
    // A-03: Validate date params before passing to PostgREST.
    if (dateFrom && !isValidDate(dateFrom)) {
      return NextResponse.json({ error: "Invalid dateFrom parameter." }, { status: 400 });
    }
    if (dateTo && !isValidDate(dateTo)) {
      return NextResponse.json({ error: "Invalid dateTo parameter." }, { status: 400 });
    }

    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 25;
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select(
        "id, email, phone, first_name, last_name, city, country, total, subtotal, discount, shipping, status, payment_method, shipping_method, promo_code, created_at, tracking_number",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") query = query.eq("status", status);

    if (search) {
      const s = sanitizeSearchTerm(search);
      if (s) {
        query = query.or(
          `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
        );
      }
    }

    if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
    if (dateTo)   query = query.lte("created_at", `${dateTo}T23:59:59`);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ orders: data, total: count, page, limit });
  } catch (err) {
    console.error("Admin orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
