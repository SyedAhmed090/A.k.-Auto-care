import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import RevenueChart from "./RevenueChart";

const STATUS_COLORS: Record<string, string> = {
  pending:"#f59e0b", confirmed:"#3b82f6", processing:"#8b5cf6",
  shipped:"#06b6d4",  delivered:"#4ade80",  cancelled:"#ef4444", refunded:"#9ca3af",
};

async function getStats() {
  try {
    const supabase = createAdminClient();
    const [ordersRes, revenueRes, pendingRes, todayRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total").not("status", "in", '("cancelled","refunded")'),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);
    const totalRevenue = (revenueRes.data ?? []).reduce((a, o) => a + Number(o.total ?? 0), 0);
    return { totalOrders: ordersRes.count ?? 0, totalRevenue, pendingOrders: pendingRes.count ?? 0, todayOrders: todayRes.count ?? 0 };
  } catch {
    return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, todayOrders: 0 };
  }
}

async function getRecentOrders() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("id, first_name, last_name, total, status, payment_method, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    return data ?? [];
  } catch { return []; }
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentOrders()]);

  const cards = [
    { label: "Total Orders",  value: stats.totalOrders.toString(),                       sub: "all time" },
    { label: "Revenue",       value: `Rs ${stats.totalRevenue.toLocaleString("en-PK")}`, sub: "excl. cancelled/refunded" },
    { label: "Pending",       value: stats.pendingOrders.toString(),                      sub: "need action", accent: true },
    { label: "Today",         value: stats.todayOrders.toString(),                        sub: "new orders" },
  ];

  return (
    <div>
      <h1 className="text-[1.8rem] uppercase mb-6" style={{ fontFamily: "var(--font-anton)" }}>Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="rounded-[16px] p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <p className="text-[.68rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{c.label}</p>
            <p className="text-[2rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)", color: c.accent ? "var(--accent)" : "var(--text)" }}>{c.value}</p>
            <p className="text-[.72rem] mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <RevenueChart />

      {/* Recent orders */}
      <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--line)" }}>
          <h2 className="font-semibold uppercase text-sm" style={{ fontFamily: "var(--font-space-mono)" }}>Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>View all →</Link>
        </div>
        <div>
          {recent.length === 0 && (
            <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--muted)" }}>No orders yet.</p>
          )}
          {recent.map((o: any) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between px-5 py-4 border-t hover:bg-white/[.02] transition-colors"
              style={{ borderColor: "var(--line)" }}>
              <div>
                <p className="text-sm font-semibold">{o.first_name} {o.last_name}</p>
                <p className="text-[.72rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  AK-{o.id.slice(0, 8).toUpperCase()} · {o.payment_method?.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ fontFamily: "var(--font-hanken)" }}>
                  Rs {Number(o.total).toLocaleString("en-PK")}
                </p>
                <span className="text-[.65rem] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{ background: `${STATUS_COLORS[o.status] ?? "#9ca3af"}22`, color: STATUS_COLORS[o.status] ?? "#9ca3af", fontFamily: "var(--font-space-mono)" }}>
                  {o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
