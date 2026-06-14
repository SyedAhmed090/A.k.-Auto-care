"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import type { Order } from "@/types/order";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
  shipped: "#06b6d4", delivered: "#4ade80", cancelled: "#ef4444", refunded: "#9ca3af",
};

const CARRIERS = ["TCS", "Leopards", "PostEx", "DHL", "M&P", "Call Courier", "Trax", "Other"];

function formatPrice(price: number) {
  return `Rs ${Math.round(price).toLocaleString("en-PK")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
}


const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".65rem",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--line-2)",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-hanken)",
  fontSize: ".9rem",
  outline: "none",
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.order) { setNotFound(true); return; }
        const o: Order = d.order;
        setOrder(o);
        setStatus(o.status);
        setTracking(o.tracking_number ?? "");
        setCarrier(o.tracking_carrier ?? "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!order) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tracking_number: tracking, tracking_carrier: carrier }),
      });
      const d = await res.json();
      if (!res.ok) {
        setSaveMsg({ ok: false, text: d.error ?? "Failed to save." });
      } else {
        setOrder((prev) => prev ? { ...prev, status, tracking_number: tracking, tracking_carrier: carrier } : prev);
        setSaveMsg({ ok: true, text: "Changes saved." });
        setTimeout(() => setSaveMsg(null), 3000);
      }
    } catch {
      setSaveMsg({ ok: false, text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--muted)", fontFamily: "var(--font-space-mono)", fontSize: ".8rem" }}>
        Loading…
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>Order not found.</p>
        <Link href="/admin/orders" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)", fontSize: ".8rem" }}>← Back to Orders</Link>
      </div>
    );
  }

  const displayId = `AK-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <Link
          href="/admin/orders"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: ".75rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
        >
          ← Orders
        </Link>
        <span style={{ color: "var(--line-2)" }}>/</span>
        <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "1.8rem", textTransform: "uppercase", margin: 0 }}>
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span style={{
          fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase",
          fontWeight: 700, padding: "5px 12px", borderRadius: 999,
          background: `${STATUS_COLORS[order.status] ?? "#9ca3af"}22`,
          color: STATUS_COLORS[order.status] ?? "#9ca3af",
        }}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden" }}>
            <h2 style={{ padding: "14px 20px", margin: 0, fontSize: ".75rem", fontFamily: "var(--font-space-mono)", letterSpacing: ".12em", textTransform: "uppercase", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
              Customer
            </h2>
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {[
                { l: "Name", v: `${order.first_name} ${order.last_name}` },
                { l: "Email", v: order.email },
                { l: "Phone / WhatsApp", v: order.phone ?? "—" },
                { l: "City", v: order.city },
                { l: "Address", v: order.address },
                { l: "Country", v: order.country },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 4px" }}>{l}</p>
                  <p style={{ margin: 0, fontSize: ".9rem", fontWeight: 600 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface)", overflowX: "auto" }}>
            <h2 style={{ padding: "14px 20px", margin: 0, fontSize: ".75rem", fontFamily: "var(--font-space-mono)", letterSpacing: ".12em", textTransform: "uppercase", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
              Items
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  {["Product", "Variant / SKU", "Qty", "Unit Price", "Total"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: h === "Product" ? "left" : "right", fontFamily: "var(--font-space-mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item, i) => (
                  <tr key={i} style={{ borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {item.image && (
                          <img src={item.image} alt={item.productName} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)", flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: 600, fontSize: ".88rem" }}>{item.productName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: ".8rem", color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{item.variantLabel}</p>
                      <p style={{ margin: "2px 0 0", fontSize: ".72rem", color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>{item.variantSku}</p>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "var(--font-space-mono)", fontSize: ".85rem" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "var(--font-hanken)", fontSize: ".85rem", color: "var(--muted)" }}>
                      {formatPrice(item.price)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "var(--font-hanken)", fontSize: ".9rem", fontWeight: 600 }}>
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 280, marginLeft: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem" }}>
                  <span style={{ color: "var(--muted)" }}>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem" }}>
                    <span style={{ color: "var(--muted)" }}>Discount {order.promo_code ? `(${order.promo_code})` : ""}</span>
                    <span style={{ color: "var(--accent)" }}>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem" }}>
                  <span style={{ color: "var(--muted)" }}>Shipping ({order.shipping_method})</span>
                  <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.05rem", paddingTop: 10, borderTop: "1px solid var(--line)", marginTop: 2 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "var(--font-hanken)" }}>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid var(--line-2)", fontFamily: "var(--font-space-mono)", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
              Payment: {order.payment_method?.toUpperCase() ?? "—"}
            </span>
            <span style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid var(--line-2)", fontFamily: "var(--font-space-mono)", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
              Shipping: {order.shipping_method}
            </span>
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface)", padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ margin: 0, fontSize: ".75rem", fontFamily: "var(--font-space-mono)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
              Manage Order
            </h2>

            <div>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 8px" }}>Current Status</p>
              <span style={{
                fontFamily: "var(--font-space-mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase",
                fontWeight: 700, padding: "5px 12px", borderRadius: 999,
                background: `${STATUS_COLORS[order.status] ?? "#9ca3af"}22`,
                color: STATUS_COLORS[order.status] ?? "#9ca3af",
              }}>
                {order.status}
              </span>
            </div>

            <div>
              <label style={labelStyle}>Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} style={{ background: "var(--surface)" }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tracking Number</label>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. TCS-123456789"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Tracking Carrier</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
              >
                <option value="">— Select carrier —</option>
                {CARRIERS.map((c) => (
                  <option key={c} value={c} style={{ background: "var(--surface)" }}>{c}</option>
                ))}
              </select>
            </div>

            {saveMsg && (
              <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: ".8rem", fontFamily: "var(--font-space-mono)", background: saveMsg.ok ? "#4ade8020" : "#ef444420", border: `1px solid ${saveMsg.ok ? "#4ade8040" : "#ef444440"}`, color: saveMsg.ok ? "#4ade80" : "#ef4444" }}>
                {saveMsg.text}
              </div>
            )}

            <button
              onClick={save}
              disabled={saving}
              style={{
                width: "100%", padding: "13px", borderRadius: 11, border: "none",
                background: saving ? "var(--line-2)" : "var(--accent)",
                color: "#0c0b08", fontFamily: "var(--font-hanken)", fontWeight: 700,
                fontSize: ".95rem", cursor: saving ? "not-allowed" : "pointer", transition: "background .2s",
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            {order.phone && (
              <a
                href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=Hi ${order.first_name}, your A.K. Auto Care order ${displayId} is now ${status}.${tracking ? ` Tracking: ${tracking}` : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "12px", borderRadius: 11, textDecoration: "none",
                  background: "#25D366", color: "#fff", fontFamily: "var(--font-hanken)", fontWeight: 700, fontSize: ".9rem",
                }}
              >
                WhatsApp Customer
              </a>
            )}

            <div style={{ paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { l: "Order ID", v: displayId },
                { l: "Placed", v: formatDate(order.created_at) },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: ".62rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>{l}</span>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: ".75rem" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
