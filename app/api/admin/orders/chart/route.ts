import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("orders")
      .select("created_at, total, status")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Build a map pre-filled with every day
    const byDate: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      byDate[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
    }

    for (const row of data ?? []) {
      const key = row.created_at.slice(0, 10);
      if (!byDate[key]) continue;
      byDate[key].orders += 1;
      if (!["cancelled", "refunded"].includes(row.status)) {
        byDate[key].revenue += Number(row.total);
      }
    }

    const days = Object.entries(byDate).map(([date, v]) => ({ date, ...v }));
    return NextResponse.json({ days });
  } catch {
    return NextResponse.json({ days: [] });
  }
}
