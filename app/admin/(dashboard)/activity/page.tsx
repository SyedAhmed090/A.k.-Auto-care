"use client";
import { useEffect, useState, useCallback } from "react";
import { History, Loader2, Search } from "lucide-react";

type Entry = {
  id: string;
  actor: string;
  admin_via: string;
  action: string;
  entity: string | null;
  entity_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)", fontFamily: "var(--font-space-mono)", fontSize: ".68rem", letterSpacing: ".14em",
};

// Color-code by action prefix.
function actionColor(action: string): { bg: string; color: string } {
  if (action.includes("delete")) return { bg: "rgba(239,68,68,.15)", color: "#ef4444" };
  if (action.includes("login")) return { bg: "rgba(59,130,246,.15)", color: "#3b82f6" };
  if (action.includes("create")) return { bg: "rgba(34,197,94,.15)", color: "#22c55e" };
  return { bg: "rgba(234,179,8,.15)", color: "#eab308" };
}

function summarize(meta: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  return Object.entries(meta)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join(" · ");
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("action", q);
      const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
      if (res.status === 403) { setForbidden(true); setLoading(false); return; }
      const json = await res.json();
      setEntries(json.entries ?? []);
    } catch {
      /* best-effort */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [load, search]);

  if (forbidden) {
    return (
      <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">Owner / manager access only</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Activity Log</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Who changed what, most recent first</p>
        </div>
      </div>

      <div className="relative max-w-xs mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action…"
          className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading activity…
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No activity recorded yet</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["When", "Who", "Action", "Target", "Details"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const ac = actionColor(e.action);
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(e.created_at).toLocaleString("en-PK")}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text)" }}>{e.actor}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[.62rem] px-2 py-0.5 rounded-full uppercase font-bold whitespace-nowrap" style={{ background: ac.bg, color: ac.color, fontFamily: "var(--font-space-mono)" }}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {e.entity ?? "—"}{e.entity_id ? ` #${e.entity_id.slice(0, 8)}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--muted)" }}>{summarize(e.meta)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
