"use client";
import { useEffect, useState, useCallback } from "react";
import { Mail, Search, Download } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  created_at: string | null;
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const load = useCallback(async (q: string, s: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (s) params.set("sort", s);
    const res = await fetch(`/api/admin/newsletter?${params.toString()}`);
    const json = await res.json();
    setSubscribers(json.subscribers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(search, sort); }, [load, search, sort]);

  const exportUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    return `/api/admin/newsletter/export?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Newsletter</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{subscribers.length} subscribers</p>
        </div>
        <a
          href={exportUrl()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email…"
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
          <option value="recent">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Mail className="w-6 h-6 animate-pulse mr-3" /> Loading subscribers…
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No subscribers found</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Email", "Source", "Signed Up"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-white/[.03]" style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="px-5 py-4 font-semibold" style={{ color: "var(--text)" }}>{s.email}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{s.source || "—"}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    {s.created_at ? new Date(s.created_at).toLocaleDateString("en-PK") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
