import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const sort = searchParams.get("sort") ?? "spend";

    const sortColumn =
      sort === "orders" ? "order_count" :
      sort === "recent" ? "last_order_at" :
      "total_spend";

    const sb = createAdminClient();
    let query = (sb as any)
      .from("customer_summary")
      .select("email, first_name, last_name, phone, city, order_count, total_spend, last_order_at")
      .order(sortColumn, { ascending: false })
      .range(0, 499);

    if (search) {
      const q = search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(
        `email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ customers: data ?? [] });
  } catch (err) {
    console.error("Admin customers GET error:", err);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}
