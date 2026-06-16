"use client";
import { useEffect, useState, useCallback } from "react";
import { FlaskConical, Search, X, MessageCircle, Phone, Mail, Loader2 } from "lucide-react";
import { SAMPLE_STATUSES, type SampleStatus } from "@/lib/sampleRequest";

type SampleRequest = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
  business_name: string | null;
  monthly_usage: string;
  status: SampleStatus;
  created_at: string;
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

const statusColors: Record<string, { bg: string; color: string }> = {
  new:       { bg: "rgba(79,168,230,.15)", color: "var(--accent)" },
  contacted: { bg: "rgba(234,179,8,.15)",  color: "#eab308" },
  converted: { bg: "rgba(34,197,94,.15)",  color: "#22c55e" },
  closed:    { bg: "rgba(255,255,255,.08)", color: "var(--muted)" },
};

function statusStyle(s: string) {
  return statusColors[s] ?? { bg: "rgba(255,255,255,.08)", color: "var(--muted)" };
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

// Best-effort conversion of a local PK number to a wa.me-friendly international form.
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  return digits;
}

export default function SampleRequestsPage() {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<SampleRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async (q: string, f: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (f) params.set("status", f);
    const res = await fetch(`/api/admin/sample-requests?${params.toString()}`);
    const json = await res.json();
    setRequests(json.requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(search, filter); }, [load, search, filter]);

  const patchStatus = async (id: string, status: SampleStatus) => {
    setUpdating(true);
    await fetch(`/api/admin/sample-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    setUpdating(false);
  };

  const openDrawer = (r: SampleRequest) => {
    setSelected(r);
    setDrawerOpen(true);
    if (r.status === "new") patchStatus(r.id, "contacted");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Sample Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{requests.length} shown</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, business, product…"
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
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
          <FlaskConical className="w-6 h-6 animate-pulse mr-3" /> Loading requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No sample requests found</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Customer", "Product", "Monthly Usage", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const sc = statusStyle(r.status);
                return (
                  <tr
                    key={r.id}
                    onClick={() => openDrawer(r)}
                    className="transition-colors hover:bg-white/[.03] cursor-pointer"
                    style={{ borderBottom: "1px solid var(--line)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold" style={{ color: "var(--text)", fontWeight: r.status === "new" ? 700 : 600 }}>{r.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                        {r.business_name ? `${r.business_name} · ` : ""}{r.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: "var(--text)" }}>{r.product_name}</td>
                    <td className="px-5 py-4" style={{ color: "var(--text)" }}>{r.monthly_usage}</td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(r.created_at).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[.62rem] px-2 py-0.5 rounded-full uppercase font-bold" style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-space-mono)" }}>
                        {r.status}
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
                    {selected.business_name && (
                      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{selected.business_name}</div>
                    )}
                    <div className="text-[.65rem] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(selected.created_at).toLocaleString("en-PK")}
                    </div>
                  </div>
                  <button onClick={closeDrawer} className="p-2 rounded-[8px] transition-colors hover:bg-white/10 cursor-pointer flex-shrink-0" style={{ color: "var(--muted)" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 flex-1 space-y-5">
                  <Field label="Product" value={selected.product_name} />
                  <Field label="Estimated Monthly Usage" value={selected.monthly_usage} highlight />
                  <Field label="Phone" value={selected.phone} mono />
                  {selected.email && <Field label="Email" value={selected.email} mono />}
                  {selected.city && <Field label="City" value={selected.city} />}
                  {selected.address && <Field label="Address" value={selected.address} />}
                </div>

                <div className="p-6 pt-4 space-y-2.5" style={{ borderTop: "1px solid var(--line)" }}>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`https://wa.me/${waNumber(selected.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: "var(--accent)", color: "#000" }}
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  </div>
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent("Your A.K. Auto Care sample request")}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold w-full transition-all"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
                    >
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  )}

                  <div>
                    <p className="text-[.68rem] uppercase tracking-[.14em] mb-2 font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SAMPLE_STATUSES.map((s) => {
                        const active = selected.status === s;
                        const sc = statusStyle(s);
                        return (
                          <button
                            key={s}
                            onClick={() => patchStatus(selected.id, s)}
                            disabled={updating}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-semibold uppercase transition-all cursor-pointer disabled:opacity-50"
                            style={{
                              background: active ? sc.bg : "var(--surface)",
                              border: `1px solid ${active ? sc.color : "var(--line)"}`,
                              color: active ? sc.color : "var(--muted)",
                              fontFamily: "var(--font-space-mono)",
                            }}
                          >
                            {updating && active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <h3 className="text-[.68rem] uppercase tracking-[.14em] mb-1.5 font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{label}</h3>
      <p
        className="text-sm break-words"
        style={{
          color: highlight ? "var(--accent)" : "var(--text)",
          fontWeight: highlight ? 700 : 500,
          fontFamily: mono ? "var(--font-space-mono)" : "var(--font-hanken)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
