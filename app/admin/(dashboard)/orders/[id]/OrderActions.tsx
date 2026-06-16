"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_COLORS as STATUS_COLORS } from "@/lib/orderStatus";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

export default function OrderActions({ order }: { order: any }) {
  const [status, setStatus] = useState<string>(order.status);
  const [tracking, setTracking] = useState<string>(order.tracking_number ?? "");
  const [notes, setNotes] = useState<string>(order.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking_number: tracking, notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-[10px] text-sm outline-none";
  const inputStyle = { background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };

  return (
    <div className="rounded-[16px] p-5 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
      <h2 className="text-sm font-semibold uppercase border-b pb-3" style={{ borderColor: "var(--line)", fontFamily: "var(--font-space-mono)" }}>Manage Order</h2>

      <div>
        <label className="block text-[.65rem] tracking-[.12em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Status</label>
        <div className="space-y-1.5">
          {STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] cursor-pointer transition-all" style={{ background: status === s ? `${STATUS_COLORS[s]}18` : "transparent", border: `1px solid ${status === s ? STATUS_COLORS[s] + "44" : "var(--line-2)"}` }}>
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
              <div className="w-3 h-3 rounded-full border-2 grid place-items-center flex-shrink-0" style={{ borderColor: status === s ? STATUS_COLORS[s] : "var(--line-2)" }}>
                {status === s && <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />}
              </div>
              <span className="text-[.75rem] font-semibold uppercase" style={{ color: status === s ? STATUS_COLORS[s] : "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[.65rem] tracking-[.12em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Tracking Number (TCS / Leopards)</label>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. TCS-123456789" />
      </div>

      <div>
        <label className="block text-[.65rem] tracking-[.12em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Internal Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} style={{ ...inputStyle, resize: "vertical" }} placeholder="Courier contacted, customer notified…" />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-[11px] font-semibold text-sm cursor-pointer transition-all btn-accent disabled:opacity-50"
      >
        {saved ? "✓ Saved" : saving ? "Saving…" : "Save Changes"}
      </button>

      {order.phone && (
        <a
          href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=Hi ${order.first_name}, your A.K. Auto Care order ${order.id.slice(0, 8).toUpperCase()} has been ${status}. ${tracking ? `Tracking: ${tracking}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-[11px] font-semibold text-sm cursor-pointer transition-all"
          style={{ background: "#25D366", color: "#fff" }}
        >
          WhatsApp Customer
        </a>
      )}
    </div>
  );
}
