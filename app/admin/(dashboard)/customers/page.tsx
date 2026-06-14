"use client";
import { useEffect, useState, useCallback } from "react";
import { Users, X, Search } from "lucide-react";

type Customer = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  order_count: number;
  total_spend: number;
  last_order_at: string;
};

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(234,179,8,.15)",   color: "#eab308" },
  shipped:   { bg: "rgba(59,130,246,.15)",  color: "#3b82f6" },
  delivered: { bg: "rgba(34,197,94,.15)",   color: "#22c55e" },
  cancelled: { bg: "rgba(239,68,68,.15)",   color: "#ef4444" },
};

function statusStyle(status: string) {
  return statusColors[status] ?? { bg: "rgba(255,255,255,.08)", color: "var(--muted)" };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("spend");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [drawerOrders, setDrawerOrders] = useState<Order[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async (q: string, s: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (s) params.set("sort", s);
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    const json = await res.json();
    setCustomers(json.customers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(search, sort); }, [load, search, sort]);

  const openDrawer = async (c: Customer) => {
    setSelected(c);
    setDrawerOpen(true);
    setDrawerOrders([]);
    setDrawerLoading(true);
    const res = await fetch(`/api/admin/orders?search=${encodeURIComponent(c.email)}`);
    const json = await res.json();
    setDrawerOrders(json.orders ?? []);
    setDrawerLoading(false);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  const fullName = (c: Customer) =>
    [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Customers</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{customers.length} total</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-[10px] text-sm outline-none cursor-pointer"
          style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
        >
          <option value="spend">Top Spenders</option>
          <option value="orders">Most Orders</option>
          <option value="recent">Recent</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Users className="w-6 h-6 animate-pulse mr-3" /> Loading customers…
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No customers found</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Name", "Email", "Phone", "City", "Orders", "Total Spend", "Last Order"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.email}
                  onClick={() => openDrawer(c)}
                  className="transition-colors hover:bg-white/[.03] cursor-pointer"
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold" style={{ color: "var(--text)" }}>{fullName(c)}</div>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{c.email}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{c.phone || "—"}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)" }}>{c.city || "—"}</td>
                  <td className="px-5 py-4 font-semibold">{c.order_count}</td>
                  <td className="px-5 py-4 font-semibold whitespace-nowrap">
                    Rs {c.total_spend.toLocaleString("en-PK")}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    {new Date(c.last_order_at).toLocaleDateString("en-PK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,.55)" }}
            onClick={closeDrawer}
          />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto flex flex-col"
            style={{
              background: "var(--bg)",
              borderLeft: "1px solid var(--line)",
              transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform .28s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <div className="flex items-start justify-between p-6 pb-5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div>
                {selected && (
                  <>
                    <div className="text-[1.1rem] font-bold" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
                      {fullName(selected)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {selected.email}
                    </div>
                    {selected.phone && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                        {selected.phone}
                      </div>
                    )}
                    {selected.city && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{selected.city}</div>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-[8px] transition-colors hover:bg-white/10 cursor-pointer flex-shrink-0"
                style={{ color: "var(--muted)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selected && (
              <div className="flex gap-0" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="flex-1 px-6 py-4 text-center">
                  <div className="text-[1.4rem] font-bold" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>
                    {selected.order_count}
                  </div>
                  <div className="text-[.65rem] uppercase mt-0.5" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                    Orders
                  </div>
                </div>
                <div style={{ width: "1px", background: "var(--line)" }} />
                <div className="flex-1 px-6 py-4 text-center">
                  <div className="text-[1.4rem] font-bold" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>
                    Rs {selected.total_spend.toLocaleString("en-PK")}
                  </div>
                  <div className="text-[.65rem] uppercase mt-0.5" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                    Total Spend
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 flex-1">
              <h3 className="text-[.68rem] uppercase tracking-[.14em] mb-4 font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                Recent Orders
              </h3>
              {drawerLoading ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>Loading orders…</p>
              ) : drawerOrders.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>No orders found.</p>
              ) : (
                <div className="space-y-2">
                  {drawerOrders.map((o) => {
                    const sc = statusStyle(o.status);
                    return (
                      <div
                        key={o.id}
                        className="flex items-center justify-between px-4 py-3 rounded-[10px]"
                        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
                      >
                        <div>
                          <div className="text-[.72rem] font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--text)" }}>
                            #{o.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="text-[.65rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                            {new Date(o.created_at).toLocaleDateString("en-PK")}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-xs whitespace-nowrap">
                            Rs {Number(o.total).toLocaleString("en-PK")}
                          </span>
                          <span
                            className="text-[.62rem] px-2 py-0.5 rounded-full uppercase font-bold"
                            style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-space-mono)" }}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
