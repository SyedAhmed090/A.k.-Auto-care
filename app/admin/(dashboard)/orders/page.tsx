import { createAdminClient } from "@/utils/supabase/admin";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
  shipped: "#06b6d4", delivered: "#4ade80", cancelled: "#ef4444", refunded: "#9ca3af",
};

async function getOrders(status: string, page: number) {
  try {
    const supabase = createAdminClient();
    const limit = 25;
    const offset = (page - 1) * limit;
    let query = supabase
      .from("orders")
      .select("id, email, phone, first_name, last_name, city, total, status, payment_method, shipping_method, created_at, tracking_number", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (status !== "all") query = query.eq("status", status);
    const { data, count } = await query;
    return { orders: data ?? [], total: count ?? 0, limit };
  } catch { return { orders: [], total: 0, limit: 25 }; }
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const { status = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr));
  const { orders, total, limit } = await getOrders(status, page);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.8rem] uppercase" style={{ fontFamily: "var(--font-anton)" }}>Orders <span style={{ color: "var(--muted)", fontFamily: "var(--font-hanken)", fontSize: "1rem" }}>({total})</span></h1>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className="px-3 py-1.5 rounded-[8px] text-[.72rem] font-semibold uppercase tracking-[.1em] transition-all"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: status === s ? (STATUS_COLORS[s] ?? "var(--accent)") + "22" : "var(--surface)",
              color: status === s ? (STATUS_COLORS[s] ?? "var(--accent)") : "var(--muted)",
              border: `1px solid ${status === s ? (STATUS_COLORS[s] ?? "var(--accent)") + "44" : "var(--line-2)"}`,
            }}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        {orders.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  {["Order", "Customer", "City", "Total", "Payment", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[.65rem] tracking-[.12em] uppercase font-semibold" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--line)" }}>
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-white/[.015] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[.75rem]" style={{ color: "var(--muted)" }}>AK-{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold">{o.first_name} {o.last_name}</p>
                      <p className="text-[.72rem]" style={{ color: "var(--muted)" }}>{o.phone ?? o.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[.85rem]" style={{ color: "var(--muted)" }}>{o.city}</td>
                    <td className="px-4 py-3.5 font-bold" style={{ fontFamily: "var(--font-hanken)" }}>{formatPrice(o.total)}</td>
                    <td className="px-4 py-3.5 text-[.72rem] uppercase font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{o.payment_method}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[.65rem] font-bold px-2 py-1 rounded-full uppercase" style={{ background: `${STATUS_COLORS[o.status] ?? "#9ca3af"}22`, color: STATUS_COLORS[o.status] ?? "#9ca3af", fontFamily: "var(--font-space-mono)" }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(o.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/orders/${o.id}`} className="text-[.72rem] font-semibold" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/orders?status=${status}&page=${p}`}
              className="w-8 h-8 rounded-[8px] grid place-items-center text-sm font-semibold transition-all"
              style={{ background: p === page ? "var(--accent)" : "var(--surface)", color: p === page ? "#000" : "var(--muted)", border: "1px solid var(--line-2)" }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
