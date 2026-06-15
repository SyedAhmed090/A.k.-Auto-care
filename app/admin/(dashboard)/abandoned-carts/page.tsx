"use client";
import { useEffect, useState, useCallback, Fragment } from "react";
import { ShoppingCart, ChevronDown, ChevronRight, Mail, CheckCircle2 } from "lucide-react";

type CartItem = { productName?: string; price?: number; quantity?: number; image?: string };

type Cart = {
  id: string;
  email: string;
  items: CartItem[];
  item_count: number;
  value: number;
  created_at: string;
  email_sent: boolean;
  recovered: boolean;
};

type Summary = {
  abandoned: number;
  emailed: number;
  recovered: number;
  recovered_value: number;
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Not Recovered" },
  { value: "recovered", label: "Recovered" },
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[140px] px-5 py-4 rounded-[14px]" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="text-[1.5rem] font-bold" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>{value}</div>
      <div className="text-[.65rem] uppercase mt-0.5" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [summary, setSummary] = useState<Summary>({ abandoned: 0, emailed: 0, recovered: 0, recovered_value: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (f: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f) params.set("filter", f);
    const res = await fetch(`/api/admin/abandoned-carts?${params.toString()}`);
    const json = await res.json();
    setCarts(json.carts ?? []);
    setSummary(json.summary ?? { abandoned: 0, emailed: 0, recovered: 0, recovered_value: 0 });
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [load, filter]);

  const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Abandoned Carts</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Recovery campaign performance</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <StatCard label="Abandoned" value={String(summary.abandoned)} />
        <StatCard label="Emails Sent" value={String(summary.emailed)} />
        <StatCard label="Recovered" value={String(summary.recovered)} />
        <StatCard label="Recovered Value" value={money(summary.recovered_value)} />
      </div>

      <div className="flex gap-1.5 mb-5">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: active ? "rgba(79,168,230,.12)" : "var(--surface)",
                border: "1px solid var(--line)",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <ShoppingCart className="w-6 h-6 animate-pulse mr-3" /> Loading carts…
        </div>
      ) : carts.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No abandoned carts</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["", "Email", "Items", "Value", "Abandoned", "Emailed", "Recovered"].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => {
                const open = expanded === c.id;
                return (
                  <Fragment key={c.id}>
                    <tr
                      onClick={() => setExpanded(open ? null : c.id)}
                      className="transition-colors hover:bg-white/[.03] cursor-pointer"
                      style={{ borderBottom: open ? "none" : "1px solid var(--line)" }}
                    >
                      <td className="px-5 py-4" style={{ color: "var(--muted)" }}>
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-5 py-4 font-semibold" style={{ color: "var(--text)" }}>{c.email || "—"}</td>
                      <td className="px-5 py-4" style={{ color: "var(--muted)" }}>{c.item_count}</td>
                      <td className="px-5 py-4 font-semibold whitespace-nowrap">{money(c.value)}</td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                        {new Date(c.created_at).toLocaleDateString("en-PK")}
                      </td>
                      <td className="px-5 py-4">
                        {c.email_sent ? <Mail className="w-4 h-4" style={{ color: "var(--accent)" }} /> : <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {c.recovered ? <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} /> : <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                    </tr>
                    {open && (
                      <tr style={{ borderBottom: "1px solid var(--line)" }}>
                        <td colSpan={7} className="px-5 pb-5 pt-1">
                          <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--line)" }}>
                            {c.items.length === 0 ? (
                              <p className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>No item details.</p>
                            ) : (
                              c.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                                  style={{ borderBottom: idx < c.items.length - 1 ? "1px solid var(--line)" : "none", background: "var(--bg)" }}
                                >
                                  <span style={{ color: "var(--text)" }}>
                                    {it.productName ?? "Item"}
                                    <span style={{ color: "var(--muted)" }}> × {it.quantity ?? 0}</span>
                                  </span>
                                  <span className="font-semibold whitespace-nowrap">{money((Number(it.price) || 0) * (Number(it.quantity) || 0))}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
