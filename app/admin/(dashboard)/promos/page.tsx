"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type Promo = {
  id: string; code: string; discount: number; min_spend: number;
  active: boolean; uses: number; max_uses: number | null;
  expires_at: string | null; created_at: string;
};

const inputCls = "w-full px-3 py-2 rounded-[10px] text-sm outline-none";
const inputSty = { background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };

export default function PromosPage() {
  const [promos, setPromos]   = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ code: "", discount: "", minSpend: "", maxUses: "", expiresAt: "" });

  const load = async () => {
    const r = await fetch("/api/admin/promos");
    const d = await r.json();
    setPromos(d.promos ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code:      form.code,
        discount:  parseFloat(form.discount) / 100,
        minSpend:  parseFloat(form.minSpend || "0"),
        maxUses:   form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    if (r.ok) {
      setForm({ code: "", discount: "", minSpend: "", maxUses: "", expiresAt: "" });
      load();
    } else {
      const d = await r.json();
      setError(d.error ?? "Failed to create promo.");
    }
    setSaving(false);
  };

  const toggle = async (p: Promo) => {
    await fetch(`/api/admin/promos/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="text-[1.8rem] uppercase mb-6" style={{ fontFamily: "var(--font-anton)" }}>Promo Codes</h1>

      {/* Create form */}
      <div className="rounded-[16px] p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <h2 className="text-sm font-semibold uppercase mb-4 pb-3 border-b" style={{ fontFamily: "var(--font-space-mono)", borderColor: "var(--line)" }}>
          Create New Code
        </h2>
        <form onSubmit={create} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          {[
            { label: "Code *",        key: "code",      type: "text",   placeholder: "SAVE10",     transform: (v: string) => v.toUpperCase() },
            { label: "Discount % *",  key: "discount",  type: "number", placeholder: "10" },
            { label: "Min Spend (Rs)",key: "minSpend",  type: "number", placeholder: "0" },
            { label: "Max Uses",      key: "maxUses",   type: "number", placeholder: "Unlimited" },
            { label: "Expires",       key: "expiresAt", type: "date",   placeholder: "" },
          ].map(({ label, key, type, placeholder, transform }) => (
            <div key={key}>
              <label className="block text-[.62rem] tracking-[.1em] uppercase mb-1.5"
                style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{label}</label>
              <input
                required={label.includes("*")}
                type={type}
                min={type === "number" ? "0" : undefined}
                max={key === "discount" ? "100" : undefined}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: transform ? transform(e.target.value) : e.target.value }))}
                className={inputCls}
                style={inputSty}
                placeholder={placeholder}
              />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="flex items-center justify-center gap-2 py-2 rounded-[10px] text-sm font-semibold btn-accent cursor-pointer disabled:opacity-50">
            <Plus className="w-4 h-4" />{saving ? "Creating…" : "Create"}
          </button>
        </form>
        {error && <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>{error}</p>}
      </div>

      {/* Table */}
      <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        {loading ? (
          <p className="text-center py-10 text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
        ) : promos.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: "var(--muted)" }}>No promo codes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  {["Code","Discount","Min Spend","Uses","Max Uses","Expires","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[.65rem] tracking-[.12em] uppercase font-semibold"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id} className="border-t hover:bg-white/[.015] transition-colors" style={{ borderColor: "var(--line)" }}>
                    <td className="px-4 py-3.5 font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}>{p.code}</td>
                    <td className="px-4 py-3.5 font-semibold">{(p.discount * 100).toFixed(0)}% off</td>
                    <td className="px-4 py-3.5" style={{ color: "var(--muted)" }}>
                      {p.min_spend > 0 ? `Rs ${Number(p.min_spend).toLocaleString("en-PK")}` : "None"}
                    </td>
                    <td className="px-4 py-3.5">{p.uses}</td>
                    <td className="px-4 py-3.5" style={{ color: "var(--muted)" }}>{p.max_uses ?? "∞"}</td>
                    <td className="px-4 py-3.5 text-[.75rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {p.expires_at ? new Date(p.expires_at).toLocaleDateString("en-PK") : "Never"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[.65rem] font-bold px-2 py-1 rounded-full uppercase"
                        style={{ background: p.active ? "#4ade8022" : "#ef444422", color: p.active ? "#4ade80" : "#ef4444", fontFamily: "var(--font-space-mono)" }}>
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggle(p)} title={p.active ? "Deactivate" : "Activate"}
                          className="cursor-pointer transition-opacity hover:opacity-70"
                          style={{ color: p.active ? "#4ade80" : "var(--muted)" }}>
                          {p.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => del(p.id)} className="cursor-pointer transition-opacity hover:opacity-70" style={{ color: "#ef4444" }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
