"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Package, Users, Layers, Repeat } from "lucide-react";

type Product = { productId: string; name: string; quantity: number; revenue: number };
type Category = { category: string; revenue: number };

type Analytics = {
  aov: number;
  totalRevenue: number;
  validOrderCount: number;
  topProducts: { byQuantity: Product[]; byRevenue: Product[] };
  revenueByCategory: Category[];
  repeatCustomers: { totalCustomers: number; repeatCustomers: number; rate: number };
  monthComparison: {
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    thisMonthOrders: number;
    lastMonthOrders: number;
    changePct: number;
  };
  newVsReturning: { newCustomers: number; returningCustomers: number };
};

const money = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

const CARD: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 14,
};

const LABEL: React.CSSProperties = {
  fontFamily: "var(--font-space-mono)",
  color: "var(--muted)",
  fontSize: ".63rem",
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

function prettyCategory(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AnalyticsSection() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"quantity" | "revenue">("quantity");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse" style={{ ...CARD, height: 180 }} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const mc = data.monthComparison;
  const up = mc.changePct >= 0;
  const nvr = data.newVsReturning;
  const totalNvr = nvr.newCustomers + nvr.returningCustomers;
  const newPct = totalNvr > 0 ? (nvr.newCustomers / totalNvr) * 100 : 0;

  const topList = tab === "quantity" ? data.topProducts.byQuantity : data.topProducts.byRevenue;
  const maxCat = Math.max(...data.revenueByCategory.map((c) => c.revenue), 1);

  return (
    <div className="mb-6 space-y-4">
      {/* Headline metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* AOV */}
        <div className="p-5" style={CARD}>
          <p className="mb-2 flex items-center gap-1.5" style={LABEL}>
            <Package size={12} /> Avg order value
          </p>
          <p className="text-[1.9rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)", color: "var(--text)" }}>
            {money(data.aov)}
          </p>
          <p className="text-[.72rem] mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
            across {data.validOrderCount} order{data.validOrderCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* This month vs last */}
        <div className="p-5" style={CARD}>
          <p className="mb-2 flex items-center gap-1.5" style={LABEL}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} This month vs last
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-[1.9rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)", color: "var(--text)" }}>
              {money(mc.thisMonthRevenue)}
            </p>
            <span
              className="text-[.8rem] font-bold"
              style={{ fontFamily: "var(--font-space-mono)", color: up ? "#4ade80" : "#ef4444" }}
            >
              {up ? "+" : ""}
              {mc.changePct}%
            </span>
          </div>
          <p className="text-[.72rem] mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
            last month {money(mc.lastMonthRevenue)}
          </p>
        </div>

        {/* Repeat customers */}
        <div className="p-5" style={CARD}>
          <p className="mb-2 flex items-center gap-1.5" style={LABEL}>
            <Repeat size={12} /> Repeat-customer rate
          </p>
          <p className="text-[1.9rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)", color: "var(--accent)" }}>
            {data.repeatCustomers.rate}%
          </p>
          <p className="text-[.72rem] mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
            {data.repeatCustomers.repeatCustomers} of {data.repeatCustomers.totalCustomers} customers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top products */}
        <div className="p-5" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <p className="flex items-center gap-1.5" style={LABEL}>
              <Package size={12} /> Top products
            </p>
            <div className="flex gap-1 rounded-[8px] p-0.5" style={{ background: "var(--bg-2)" }}>
              {(["quantity", "revenue"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-2.5 py-1 rounded-[6px] text-[.62rem] uppercase transition-colors"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    letterSpacing: ".1em",
                    background: tab === t ? "var(--surface)" : "transparent",
                    color: tab === t ? "var(--text)" : "var(--muted)",
                    border: tab === t ? "1px solid var(--line)" : "1px solid transparent",
                  }}
                >
                  {t === "quantity" ? "By qty" : "By revenue"}
                </button>
              ))}
            </div>
          </div>
          {topList.length === 0 ? (
            <p className="text-[.78rem] py-6 text-center" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
              No sales yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topList.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span
                    className="w-5 text-center text-[.7rem] font-bold shrink-0"
                    style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[.82rem] truncate" style={{ color: "var(--text)" }} title={p.name}>
                    {p.name}
                  </span>
                  <span className="text-[.8rem] font-bold shrink-0" style={{ fontFamily: "var(--font-hanken)" }}>
                    {tab === "quantity" ? `${p.quantity} sold` : money(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by category */}
        <div className="p-5" style={CARD}>
          <p className="flex items-center gap-1.5 mb-4" style={LABEL}>
            <Layers size={12} /> Revenue by category
          </p>
          {data.revenueByCategory.length === 0 ? (
            <p className="text-[.78rem] py-6 text-center" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
              No category data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.revenueByCategory.map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[.78rem]" style={{ color: "var(--text)" }}>
                      {prettyCategory(c.category)}
                    </span>
                    <span className="text-[.76rem] font-bold" style={{ fontFamily: "var(--font-hanken)" }}>
                      {money(c.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(c.revenue / maxCat) * 100}%`, background: "var(--accent)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New vs returning */}
      <div className="p-5" style={CARD}>
        <div className="flex items-center justify-between mb-3">
          <p className="flex items-center gap-1.5" style={LABEL}>
            <Users size={12} /> New vs returning customers
          </p>
          <p className="text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            this month
          </p>
        </div>
        {totalNvr === 0 ? (
          <p className="text-[.78rem] py-2" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            No orders this month yet.
          </p>
        ) : (
          <>
            <div className="h-3 rounded-full overflow-hidden flex" style={{ background: "var(--bg-2)" }}>
              <div style={{ width: `${newPct}%`, background: "var(--accent)" }} />
              <div style={{ width: `${100 - newPct}%`, background: "#4ade80" }} />
            </div>
            <div className="flex items-center justify-between mt-3 text-[.76rem]" style={{ fontFamily: "var(--font-space-mono)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--accent)" }} />
                <span style={{ color: "var(--text)" }}>{nvr.newCustomers} new</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ color: "var(--text)" }}>{nvr.returningCustomers} returning</span>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#4ade80" }} />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
