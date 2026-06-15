"use client";
import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Search, X, Mail, Check, Loader2 } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "handled";
  created_at: string;
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

const statusColors: Record<string, { bg: string; color: string }> = {
  new:     { bg: "rgba(79,168,230,.15)", color: "var(--accent)" },
  read:    { bg: "rgba(234,179,8,.15)",  color: "#eab308" },
  handled: { bg: "rgba(34,197,94,.15)",  color: "#22c55e" },
};

function statusStyle(s: string) {
  return statusColors[s] ?? { bg: "rgba(255,255,255,.08)", color: "var(--muted)" };
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "handled", label: "Handled" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Message | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async (q: string, f: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (f) params.set("status", f);
    const res = await fetch(`/api/admin/contact-messages?${params.toString()}`);
    const json = await res.json();
    setMessages(json.messages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(search, filter); }, [load, search, filter]);

  const patchStatus = async (id: string, status: Message["status"]) => {
    setUpdating(true);
    await fetch(`/api/admin/contact-messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    setUpdating(false);
  };

  const openDrawer = (m: Message) => {
    setSelected(m);
    setDrawerOpen(true);
    // Auto-advance a brand-new message to "read" on open.
    if (m.status === "new") patchStatus(m.id, "read");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Messages</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{messages.length} shown</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
          />
        </div>
        <div className="flex gap-1.5">
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <MessageSquare className="w-6 h-6 animate-pulse mr-3" /> Loading messages…
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No messages found</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["From", "Subject", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => {
                const sc = statusStyle(m.status);
                return (
                  <tr
                    key={m.id}
                    onClick={() => openDrawer(m)}
                    className="transition-colors hover:bg-white/[.03] cursor-pointer"
                    style={{ borderBottom: "1px solid var(--line)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold" style={{ color: "var(--text)", fontWeight: m.status === "new" ? 700 : 600 }}>{m.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{m.email}</div>
                    </td>
                    <td className="px-5 py-4" style={{ color: "var(--text)" }}>{m.subject}</td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(m.created_at).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[.62rem] px-2 py-0.5 rounded-full uppercase font-bold" style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-space-mono)" }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.55)" }} onClick={closeDrawer} />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto flex flex-col"
            style={{
              background: "var(--bg)",
              borderLeft: "1px solid var(--line)",
              transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform .28s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {selected && (
              <>
                <div className="flex items-start justify-between p-6 pb-5" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="min-w-0">
                    <div className="text-[1.1rem] font-bold" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>{selected.name}</div>
                    <div className="text-xs mt-1 break-all" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{selected.email}</div>
                    <div className="text-[.65rem] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(selected.created_at).toLocaleString("en-PK")}
                    </div>
                  </div>
                  <button onClick={closeDrawer} className="p-2 rounded-[8px] transition-colors hover:bg-white/10 cursor-pointer flex-shrink-0" style={{ color: "var(--muted)" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 flex-1">
                  <h3 className="text-[.68rem] uppercase tracking-[.14em] mb-2 font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Subject</h3>
                  <p className="font-semibold mb-5" style={{ color: "var(--text)" }}>{selected.subject}</p>
                  <h3 className="text-[.68rem] uppercase tracking-[.14em] mb-2 font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Message</h3>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>{selected.message}</p>
                </div>

                <div className="p-6 pt-4 space-y-2.5" style={{ borderTop: "1px solid var(--line)" }}>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + selected.subject)}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "var(--accent)", color: "#000" }}
                  >
                    <Mail className="w-4 h-4" /> Reply by Email
                  </a>
                  {selected.status !== "handled" ? (
                    <button
                      onClick={() => patchStatus(selected.id, "handled")}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold w-full transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Mark Handled
                    </button>
                  ) : (
                    <button
                      onClick={() => patchStatus(selected.id, "read")}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold w-full transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--muted)" }}
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Reopen
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
