"use client";
import { useEffect, useState, useCallback } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";

type PeriodRow = {
  period: string;
  orders: number;
  gross: number;
  discounts: number;
  shipping: number;
  gst: number;
  net: number;
};

type Totals = {
  orders: number;
  gross: number;
  discounts: number;
  shipping: number;
  gst: number;
  net: number;
};

type Report = {
  groupBy: "day" | "month";
  gstRate: number;
  gstInclusive: boolean;
  rows: PeriodRow[];
  totals: Totals;
};

const EMPTY_TOTALS: Totals = { orders: 0, gross: 0, discounts: 0, shipping: 0, gst: 0, net: 0 };

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  color: "var(--text)",
  fontFamily: "var(--font-hanken)",
};

// Default range: first day of the current month → today.
function defaultRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex-1 min-w-[140px] px-5 py-4 rounded-[14px]"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div
        className="text-[1.5rem] font-bold"
        style={{ fontFamily: "var(--font-anton)", color: accent ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </div>
      <div
        className="text-[.65rem] uppercase mt-0.5"
        style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
      >
        {label}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const init = defaultRange();
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const buildQuery = useCallback(
    (extra?: Record<string, string>) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("groupBy", groupBy);
      for (const [k, v] of Object.entries(extra ?? {})) params.set(k, v);
      return params.toString();
    },
    [from, to, groupBy]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/sales?${buildQuery()}`);
      const json = await res.json();
      setReport(json && Array.isArray(json.rows) ? json : null);
    } catch {
      setReport(null);
    }
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => { load(); }, [load]);

  const totals = report?.totals ?? EMPTY_TOTALS;
  const rows = report?.rows ?? [];
  const gstPct = report ? Math.round(report.gstRate * 100) : null;
  const csvHref = `/api/admin/reports/sales?${buildQuery({ format: "csv" })}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Sales &amp; GST summary{gstPct !== null ? ` · GST ${gstPct}%` : ""}
          </p>
        </div>
        <a
          href={csvHref}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-[.62rem] uppercase tracking-[.14em]" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>From</label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3.5 py-2.5 rounded-[10px] text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[.62rem] uppercase tracking-[.14em]" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>To</label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className="px-3.5 py-2.5 rounded-[10px] text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-1.5">
          {(["day", "month"] as const).map((g) => {
            const active = groupBy === g;
            return (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className="px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer capitalize"
                style={{
                  background: active ? "rgba(79,168,230,.12)" : "var(--surface)",
                  border: "1px solid var(--line)",
                  color: active ? "var(--accent)" : "var(--muted)",
                }}
              >
                By {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatCard label="Gross Sales" value={money(totals.gross)} accent />
        <StatCard label="Discounts" value={money(totals.discounts)} />
        <StatCard label="Shipping" value={money(totals.shipping)} />
        <StatCard label="GST" value={money(totals.gst)} />
        <StatCard label="Net (ex-GST)" value={money(totals.net)} accent />
        <StatCard label="Orders" value={String(totals.orders)} />
      </div>

      {/* Per-period table */}
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading report…
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No sales in this period</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {[groupBy === "month" ? "Month" : "Date", "Orders", "Gross", "Discounts", "Shipping", "GST", "Net (ex-GST)"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 uppercase ${i === 0 ? "text-left" : "text-right"}`} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.period} className="transition-colors hover:bg-black/[.03]" style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="px-5 py-4 text-xs font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-space-mono)", color: "var(--text)" }}>{r.period}</td>
                  <td className="px-5 py-4 text-right" style={{ color: "var(--muted)" }}>{r.orders}</td>
                  <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">{money(r.gross)}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap" style={{ color: "var(--muted)" }}>{money(r.discounts)}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap" style={{ color: "var(--muted)" }}>{money(r.shipping)}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap" style={{ color: "var(--muted)" }}>{money(r.gst)}</td>
                  <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">{money(r.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--line)", background: "var(--bg-2)" }}>
                <td className="px-5 py-4 text-xs font-bold uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--text)" }}>Total</td>
                <td className="px-5 py-4 text-right font-bold">{totals.orders}</td>
                <td className="px-5 py-4 text-right font-bold whitespace-nowrap">{money(totals.gross)}</td>
                <td className="px-5 py-4 text-right font-bold whitespace-nowrap">{money(totals.discounts)}</td>
                <td className="px-5 py-4 text-right font-bold whitespace-nowrap">{money(totals.shipping)}</td>
                <td className="px-5 py-4 text-right font-bold whitespace-nowrap">{money(totals.gst)}</td>
                <td className="px-5 py-4 text-right font-bold whitespace-nowrap" style={{ color: "var(--accent)" }}>{money(totals.net)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
