import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { inventory } = await getSettings();

    const [ordersRes, revenueRes, pendingRes, todayRes, lowStockRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      // D-05: Use server-side SUM instead of fetching all total values into JS.
      // The old select("total") fetched every row and reduced in Node — it would
      // silently truncate at PostgREST's 1000-row default cap.
      supabase.from("orders").select("total.sum()").not("status", "in", '("cancelled","refunded")').single(),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from("products").select("id", { count: "exact", head: true }).not("stock", "is", null).lte("stock", inventory.lowStockThreshold),
    ]);

    const totalRevenue = Number((revenueRes.data as unknown as { sum: number | null } | null)?.sum ?? 0);

    return NextResponse.json({
      totalOrders: ordersRes.count ?? 0,
      totalRevenue,
      pendingOrders: pendingRes.count ?? 0,
      todayOrders: todayRes.count ?? 0,
      lowStock: lowStockRes.count ?? 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}
