import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status  = searchParams.get("status");
    const search  = searchParams.get("search")?.trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo   = searchParams.get("dateTo");
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
      const s = search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
      );
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
