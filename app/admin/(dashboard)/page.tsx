import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { AlertTriangle, FlaskConical } from "lucide-react";
import RevenueChart from "./RevenueChart";
import AnalyticsSection from "./AnalyticsSection";
import { getSettings } from "@/lib/settings";
import { ORDER_STATUS_COLORS as STATUS_COLORS } from "@/lib/orderStatus";

async function getStats() {
  try {
    const supabase = createAdminClient();
    const { inventory } = await getSettings();
    const [ordersRes, revenueRes, pendingRes, todayRes, lowStockRes, newSamplesRes, totalSamplesRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      // Push SUM to Postgres — avoids fetching every order row into JS (and bypasses
      // PostgREST's 1000-row default cap that would silently under-count revenue).
      supabase.from("orders").select("total.sum()").not("status", "in", '("cancelled","refunded")').single(),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from("products").select("id", { count: "exact", head: true })
        .not("stock", "is", null).lte("stock", inventory.lowStockThreshold),
      supabase.from("sample_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("sample_requests").select("id", { count: "exact", head: true }),
    ]);
    const totalRevenue = Number((revenueRes.data as unknown as { sum: number | null } | null)?.sum ?? 0);
    return {
      totalOrders: ordersRes.count ?? 0, totalRevenue, pendingOrders: pendingRes.count ?? 0,
      todayOrders: todayRes.count ?? 0, lowStock: lowStockRes.count ?? 0,
      newSamples: newSamplesRes.count ?? 0, totalSamples: totalSamplesRes.count ?? 0,
    };
  } catch {
    return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, todayOrders: 0, lowStock: 0, newSamples: 0, totalSamples: 0 };
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

  const hasPending = stats.pendingOrders > 0;
  const cards = [
    { label: "Total Orders",  value: stats.totalOrders.toString(),                       sub: "all time" },
    { label: "Revenue",       value: `Rs ${stats.totalRevenue.toLocaleString("en-PK")}`, sub: "excl. cancelled/refunded" },
    { label: "Pending",       value: stats.pendingOrders.toString(),                      sub: hasPending ? "needs action" : "all clear", warn: hasPending },
    { label: "Today",         value: stats.todayOrders.toString(),                        sub: "new orders" },
  ];

  return (
    <div>
      <h1 className="text-[1.8rem] uppercase mb-6" style={{ fontFamily: "var(--font-anton)" }}>Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="rounded-[16px] p-5" style={{
            background: c.warn ? "rgba(245,158,11,.08)" : "var(--surface)",
            border: `1px solid ${c.warn ? "rgba(245,158,11,.4)" : "var(--line)"}`,
          }}>
            <p className="text-[.68rem] tracking-[.14em] uppercase mb-2 flex items-center gap-1.5" style={{ fontFamily: "var(--font-space-mono)", color: c.warn ? "#f59e0b" : "var(--muted)" }}>
              {c.warn && <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "#f59e0b" }} />}
              {c.label}
            </p>
            <p className="text-[2rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)", color: c.warn ? "#f59e0b" : "var(--text)" }}>{c.value}</p>
            <p className="text-[.72rem] mt-1" style={{ color: c.warn ? "#f59e0b" : "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Low-stock alert widget */}
      {stats.lowStock > 0 && (
        <Link href="/admin/inventory?lowstock=1"
          className="flex items-center gap-3 rounded-[14px] px-5 py-4 mb-6 transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(234,179,8,.08)", border: "1px solid rgba(234,179,8,.4)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#eab308" }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "#eab308" }}>
              {stats.lowStock} product{stats.lowStock === 1 ? "" : "s"} low on stock
            </p>
            <p className="text-[.72rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
              At or below your low-stock threshold — review inventory →
            </p>
          </div>
        </Link>
      )}

      {/* Sample requests widget */}
      {stats.totalSamples > 0 && (
        <Link href="/admin/sample-requests"
          className="flex items-center gap-3 rounded-[14px] px-5 py-4 mb-6 transition-all hover:-translate-y-0.5"
          style={{
            background: stats.newSamples > 0 ? "rgba(79,168,230,.08)" : "var(--surface)",
            border: `1px solid ${stats.newSamples > 0 ? "rgba(79,168,230,.4)" : "var(--line)"}`,
          }}>
          <FlaskConical className="w-5 h-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: stats.newSamples > 0 ? "var(--accent)" : "var(--text)" }}>
              {stats.newSamples > 0
                ? `${stats.newSamples} new sample request${stats.newSamples === 1 ? "" : "s"}`
                : "Sample requests"}
            </p>
            <p className="text-[.72rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
              {stats.totalSamples} total · review and follow up →
            </p>
          </div>
        </Link>
      )}

      {/* Revenue chart */}
      <RevenueChart />

      {/* Decision-grade analytics */}
      <AnalyticsSection />

      {/* Recent orders */}
      <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--line)" }}>
          <h2 className="font-semibold uppercase text-sm" style={{ fontFamily: "var(--font-space-mono)" }}>Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>View all →</Link>
        </div>
        <div>
          {recent.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No orders yet</p>
              <p className="text-[.78rem] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                New customer orders will appear here as they come in.
              </p>
            </div>
          )}
          {recent.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between px-5 py-4 border-t hover:bg-black/[.02] transition-colors"
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
                  style={{ background: `${STATUS_COLORS[o.status ?? ""] ?? "#9ca3af"}22`, color: STATUS_COLORS[o.status ?? ""] ?? "#9ca3af", fontFamily: "var(--font-space-mono)" }}>
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
