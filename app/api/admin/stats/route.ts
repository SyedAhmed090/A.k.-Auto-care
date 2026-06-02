import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [ordersRes, revenueRes, pendingRes, todayRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total").not("status", "in", '("cancelled","refunded")'),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);

    const totalRevenue = (revenueRes.data ?? []).reduce((acc: number, o: { total: number }) => acc + (o.total ?? 0), 0);

    return NextResponse.json({
      totalOrders: ordersRes.count ?? 0,
      totalRevenue,
      pendingOrders: pendingRes.count ?? 0,
      todayOrders: todayRes.count ?? 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}
