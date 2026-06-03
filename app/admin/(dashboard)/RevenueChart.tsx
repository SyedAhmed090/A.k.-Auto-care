"use client";
import { useEffect, useState } from "react";

type Day = { date: string; revenue: number; orders: number };

export default function RevenueChart() {
  const [data, setData] = useState<Day[]>([]);
  const [tip, setTip] = useState<{ idx: number; day: Day } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders/chart")
      .then(r => r.json())
      .then(d => { setData(d.days ?? []); setLoading(false); });
  }, []);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = data.reduce((s, d) => s + d.orders, 0);

  if (loading) {
    return (
      <div className="rounded-[16px] p-5 mb-6 animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--line)", height: 190 }} />
    );
  }

  const W = 600, H = 90;
  const maxRev = Math.max(...data.map(d => d.revenue), 1);

  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: H - (d.revenue / maxRev) * H * 0.88 - 4,
    day: d,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  const tipPt = tip !== null ? pts[tip.idx] : null;

  return (
    <div className="rounded-[16px] p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[.63rem] tracking-[.14em] uppercase mb-1" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Revenue — last 30 days</p>
          <p className="text-[1.7rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)" }}>
            Rs {totalRevenue.toLocaleString("en-PK")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[.63rem] tracking-[.14em] uppercase mb-1" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Orders</p>
          <p className="text-[1.7rem] font-bold leading-none" style={{ fontFamily: "var(--font-hanken)" }}>{totalOrders}</p>
        </div>
      </div>

      <div className="relative select-none">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 90, overflow: "visible" }}
          onMouseLeave={() => setTip(null)}
        >
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d8ff35" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#d8ff35" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#rg)" />
          <path d={line} fill="none" stroke="#d8ff35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* hover targets */}
          {pts.map((p, i) => (
            <rect
              key={i}
              x={i === 0 ? 0 : (pts[i - 1].x + p.x) / 2}
              y={0}
              width={i === pts.length - 1
                ? W - (pts[i - 1] ? (pts[i - 1].x + p.x) / 2 : 0)
                : ((pts[i + 1]?.x ?? p.x) + p.x) / 2 - (i === 0 ? 0 : (pts[i - 1].x + p.x) / 2)}
              height={H}
              fill="transparent"
              onMouseEnter={() => setTip({ idx: i, day: p.day })}
            />
          ))}

          {/* active dot */}
          {tipPt && (
            <circle cx={tipPt.x} cy={tipPt.y} r="4" fill="#d8ff35" stroke="var(--bg)" strokeWidth="2" />
          )}
        </svg>

        {/* tooltip */}
        {tip && tipPt && (
          <div
            className="absolute pointer-events-none z-10 rounded-[8px] px-3 py-2 text-xs"
            style={{
              left: `${(tipPt.x / W) * 100}%`,
              bottom: "calc(100% - " + ((tipPt.y / H) * 100) + "%)",
              transform: "translateX(-50%) translateY(-8px)",
              background: "var(--bg)",
              border: "1px solid var(--line)",
              fontFamily: "var(--font-space-mono)",
              whiteSpace: "nowrap",
            }}
          >
            <p style={{ color: "var(--muted)" }}>{tip.day.date}</p>
            <p className="font-bold" style={{ color: "var(--text)" }}>Rs {tip.day.revenue.toLocaleString("en-PK")}</p>
            <p style={{ color: "var(--muted)" }}>{tip.day.orders} order{tip.day.orders !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}
