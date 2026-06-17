"use client";
import { useEffect, useState, useCallback } from "react";
import { Settings as SettingsIcon, Loader2, Check, Truck, Percent, CreditCard, Store, Share2, Boxes } from "lucide-react";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";

type Tab = "shipping" | "tax" | "payment" | "store" | "social" | "inventory";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "tax", label: "Tax", icon: Percent },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "store", label: "Store", icon: Store },
  { id: "social", label: "Social", icon: Share2 },
  { id: "inventory", label: "Inventory", icon: Boxes },
];

const labelCls = "block text-[.72rem] tracking-[.14em] uppercase mb-2";
const labelStyle: React.CSSProperties = { fontFamily: "var(--font-space-mono)", color: "var(--muted)" };
const inputCls = "w-full px-4 py-2.5 rounded-[10px] text-sm outline-none";
const inputStyle: React.CSSProperties = { background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls} style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} style={inputStyle} />;
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <input type="number" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className={inputCls} style={inputStyle} />;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("shipping");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.settings) setSettings(json.settings);
    } catch {
      setError("Failed to load settings.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Immutable nested update helper.
  const update = <K extends keyof Settings>(group: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [group]: value }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      if (json.settings) setSettings(json.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
    setSaving(false);
  };

  const s = settings;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Edit business config without a code change</p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: saved ? "#22c55e" : "var(--accent)", color: "var(--on-accent)" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <SettingsIcon className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {error && (
        <p className="text-sm mb-4 py-2 px-4 rounded-[10px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>{error}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: active ? "rgba(79,168,230,.12)" : "var(--surface)",
                border: "1px solid var(--line)",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <SettingsIcon className="w-6 h-6 animate-pulse mr-3" /> Loading settings…
        </div>
      ) : (
        <div className="rounded-[16px] p-6 max-w-2xl" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          {tab === "shipping" && (
            <div className="space-y-5">
              <Field label="Free shipping threshold (Rs)">
                <NumberInput value={s.shipping.freeThreshold} onChange={(v) => update("shipping", { ...s.shipping, freeThreshold: v })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Domestic standard (Rs)">
                  <NumberInput value={s.shipping.domestic.standard} onChange={(v) => update("shipping", { ...s.shipping, domestic: { ...s.shipping.domestic, standard: v } })} />
                </Field>
                <Field label="Domestic express (Rs)">
                  <NumberInput value={s.shipping.domestic.express} onChange={(v) => update("shipping", { ...s.shipping, domestic: { ...s.shipping.domestic, express: v } })} />
                </Field>
                <Field label="International standard (Rs)">
                  <NumberInput value={s.shipping.international.standard} onChange={(v) => update("shipping", { ...s.shipping, international: { ...s.shipping.international, standard: v } })} />
                </Field>
                <Field label="International express (Rs)">
                  <NumberInput value={s.shipping.international.express} onChange={(v) => update("shipping", { ...s.shipping, international: { ...s.shipping.international, express: v } })} />
                </Field>
              </div>
              <Field label="Domestic standard ETA">
                <TextInput value={s.shipping.etas.domesticStandard} onChange={(v) => update("shipping", { ...s.shipping, etas: { ...s.shipping.etas, domesticStandard: v } })} />
              </Field>
              <Field label="Domestic express ETA">
                <TextInput value={s.shipping.etas.domesticExpress} onChange={(v) => update("shipping", { ...s.shipping, etas: { ...s.shipping.etas, domesticExpress: v } })} />
              </Field>
              <Field label="International standard ETA">
                <TextInput value={s.shipping.etas.intlStandard} onChange={(v) => update("shipping", { ...s.shipping, etas: { ...s.shipping.etas, intlStandard: v } })} />
              </Field>
              <Field label="International express ETA">
                <TextInput value={s.shipping.etas.intlExpress} onChange={(v) => update("shipping", { ...s.shipping, etas: { ...s.shipping.etas, intlExpress: v } })} />
              </Field>
            </div>
          )}

          {tab === "tax" && (
            <div className="space-y-5">
              <Field label="GST rate (%)">
                <NumberInput value={Math.round(s.tax.gstRate * 1000) / 10} onChange={(v) => update("tax", { ...s.tax, gstRate: v / 100 })} />
              </Field>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={s.tax.gstInclusive} onChange={(e) => update("tax", { ...s.tax, gstInclusive: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Displayed prices include GST (inclusive)</span>
              </label>
            </div>
          )}

          {tab === "payment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="JazzCash number"><TextInput value={s.payment.jazzcash.number} onChange={(v) => update("payment", { ...s.payment, jazzcash: { ...s.payment.jazzcash, number: v } })} /></Field>
                <Field label="JazzCash account name"><TextInput value={s.payment.jazzcash.name} onChange={(v) => update("payment", { ...s.payment, jazzcash: { ...s.payment.jazzcash, name: v } })} /></Field>
                <Field label="EasyPaisa number"><TextInput value={s.payment.easypaisa.number} onChange={(v) => update("payment", { ...s.payment, easypaisa: { ...s.payment.easypaisa, number: v } })} /></Field>
                <Field label="EasyPaisa account name"><TextInput value={s.payment.easypaisa.name} onChange={(v) => update("payment", { ...s.payment, easypaisa: { ...s.payment.easypaisa, name: v } })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bank name"><TextInput value={s.payment.bank.bank} onChange={(v) => update("payment", { ...s.payment, bank: { ...s.payment.bank, bank: v } })} /></Field>
                <Field label="Account number"><TextInput value={s.payment.bank.account} onChange={(v) => update("payment", { ...s.payment, bank: { ...s.payment.bank, account: v } })} /></Field>
                <Field label="Branch"><TextInput value={s.payment.bank.branch} onChange={(v) => update("payment", { ...s.payment, bank: { ...s.payment.bank, branch: v } })} /></Field>
                <Field label="Account title"><TextInput value={s.payment.bank.title} onChange={(v) => update("payment", { ...s.payment, bank: { ...s.payment.bank, title: v } })} /></Field>
              </div>
            </div>
          )}

          {tab === "store" && (
            <div className="space-y-5">
              <Field label="Contact email"><TextInput value={s.store.email} onChange={(v) => update("store", { ...s.store, email: v })} /></Field>
              <Field label="WhatsApp number (digits only, e.g. 923000000000)"><TextInput value={s.store.whatsapp} onChange={(v) => update("store", { ...s.store, whatsapp: v })} /></Field>
              <Field label="Address"><TextInput value={s.store.address} onChange={(v) => update("store", { ...s.store, address: v })} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City"><TextInput value={s.store.city} onChange={(v) => update("store", { ...s.store, city: v })} /></Field>
                <Field label="Country"><TextInput value={s.store.country} onChange={(v) => update("store", { ...s.store, country: v })} /></Field>
              </div>
              <Field label="Business hours"><TextInput value={s.store.hours} onChange={(v) => update("store", { ...s.store, hours: v })} /></Field>
              <Field label="Map search query"><TextInput value={s.store.mapQuery} onChange={(v) => update("store", { ...s.store, mapQuery: v })} /></Field>
            </div>
          )}

          {tab === "social" && (
            <div className="space-y-5">
              <Field label="Instagram URL"><TextInput value={s.social.instagram} onChange={(v) => update("social", { ...s.social, instagram: v })} /></Field>
              <Field label="Facebook URL"><TextInput value={s.social.facebook} onChange={(v) => update("social", { ...s.social, facebook: v })} /></Field>
              <Field label="TikTok URL"><TextInput value={s.social.tiktok} onChange={(v) => update("social", { ...s.social, tiktok: v })} /></Field>
              <Field label="YouTube URL (leave blank to hide)"><TextInput value={s.social.youtube} onChange={(v) => update("social", { ...s.social, youtube: v })} /></Field>
            </div>
          )}

          {tab === "inventory" && (
            <div className="space-y-5">
              <Field label="Low-stock threshold (alert at/under this quantity)">
                <NumberInput value={s.inventory.lowStockThreshold} onChange={(v) => update("inventory", { ...s.inventory, lowStockThreshold: Math.round(v) })} />
              </Field>
              <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                Used by the inventory “Low” status, the dashboard low-stock widget, and the daily low-stock email digest.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
