"use client";
import { useState } from "react";
import type { Order } from "@/types/order";
import { ORDER_STATUS_COLORS as STATUS_COLORS } from "@/lib/orderStatus";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
type OrderStatus = typeof STATUSES[number] | "cancelled" | "refunded";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏳",
  confirmed: "✓",
  processing: "⚙",
  shipped: "🚚",
  delivered: "📦",
};

// Delivery estimate tied to the chosen shipping method (mirrors lib/commerce options).
const DELIVERY_ESTIMATES: Record<string, string> = {
  "pk-standard": "Karachi 1–2 days, other cities 3–5 days",
  "pk-express": "Karachi same/next day, other cities 2–3 days",
  "intl-standard": "10–20 business days",
  "intl-express": "5–7 business days",
};

// Friendly labels for the raw shipping_method id stored on the order.
const SHIPPING_METHOD_LABELS: Record<string, string> = {
  "pk-standard": "Standard Delivery",
  "pk-express": "Express Delivery",
  "intl-standard": "International Standard",
  "intl-express": "International Express",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });
}

function getStepIndex(status: string) {
  const idx = STATUSES.indexOf(status as typeof STATUSES[number]);
  return idx === -1 ? -1 : idx;
}


export default function OrderTrackingClient() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/order-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTracking = () => {
    if (!order?.tracking_number) return;
    navigator.clipboard.writeText(order.tracking_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeStep = order ? getStepIndex(order.status) : -1;
  const isCancelledOrRefunded = order && (order.status === "cancelled" || order.status === "refunded");

  const inputStyle: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--line-2)",
    color: "var(--text)",
    fontFamily: "var(--font-hanken)",
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "var(--font-hanken)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
            A.K. Auto Care
          </p>
          <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem, 6vw, 3.5rem)", textTransform: "uppercase", lineHeight: 1, margin: 0 }}>
            Track Your Order
          </h1>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 24px", marginBottom: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                  Order ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. AK-A1B2C3D4"
                  required
                  style={{ ...inputStyle, padding: "10px 14px", borderRadius: 10, fontSize: ".9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ ...inputStyle, padding: "10px 14px", borderRadius: 10, fontSize: ".9rem" }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "13px",
                borderRadius: 11,
                border: "none",
                background: loading ? "var(--line-2)" : "var(--accent)",
                color: "#0a0b0d",
                fontFamily: "var(--font-hanken)",
                fontWeight: 700,
                fontSize: ".95rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background .2s",
              }}
            >
              {loading ? "Searching…" : "Track Order"}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#ef444420", border: "1px solid #ef444440", color: "#ef4444", fontFamily: "var(--font-space-mono)", fontSize: ".8rem" }}>
              {error}
            </div>
          )}
        </div>

        {order && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Order Status</p>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".8rem", color: "var(--muted)" }}>
                    Placed {formatDate(order.created_at)} · Hello, {order.first_name}!
                  </p>
                </div>
                {isCancelledOrRefunded && (
                  <span style={{
                    fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase",
                    fontWeight: 700, padding: "5px 12px", borderRadius: 999,
                    background: `${STATUS_COLORS[order.status]}22`, color: STATUS_COLORS[order.status],
                  }}>
                    {order.status}
                  </span>
                )}
              </div>

              {!isCancelledOrRefunded && (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", minWidth: 440, position: "relative" }}>
                      {STATUSES.map((step, i) => {
                        const isCompleted = i <= activeStep;
                        const isActive = i === activeStep;
                        const stepColor = isCompleted ? "var(--accent)" : "var(--muted)";
                        return (
                          <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            {i < STATUSES.length - 1 && (
                              <div style={{
                                position: "absolute", top: 18, left: "50%", width: "100%", height: 2,
                                background: i < activeStep ? "var(--accent)" : "var(--line-2)",
                                transition: "background .3s",
                              }} />
                            )}
                            <div
                              role="img"
                              aria-label={`${STATUS_LABELS[step]} — ${isActive ? "current step" : isCompleted ? "completed" : "upcoming"}`}
                              aria-current={isActive ? "step" : undefined}
                              style={{
                              width: 36, height: 36, borderRadius: 999,
                              background: isCompleted ? "var(--accent)" : "var(--surface-2)",
                              border: `2px solid ${isCompleted ? "var(--accent)" : "var(--line-2)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: isActive ? "1rem" : ".85rem",
                              position: "relative", zIndex: 1,
                              transition: "all .3s",
                              color: isCompleted ? "#0a0b0d" : "var(--muted)",
                            }}>
                              {STATUS_ICONS[step]}
                            </div>
                            <p style={{
                              marginTop: 8, fontSize: ".7rem", fontFamily: "var(--font-space-mono)",
                              letterSpacing: ".06em", textTransform: "uppercase",
                              color: isActive ? "var(--accent)" : isCompleted ? "var(--text)" : "var(--muted)",
                              fontWeight: isActive ? 700 : 400,
                              whiteSpace: "nowrap",
                            }}>
                              {STATUS_LABELS[step]}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {order.status === "shipped" && (
                    <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "#06b6d420", border: "1px solid #06b6d440", fontSize: ".82rem", color: "#06b6d4", fontFamily: "var(--font-hanken)" }}>
                      Your order is on its way to {order.city}.
                      {DELIVERY_ESTIMATES[order.shipping_method]
                        ? ` Estimated delivery: ${DELIVERY_ESTIMATES[order.shipping_method]}.`
                        : ""}
                    </div>
                  )}
                </>
              )}
            </div>

            {order.tracking_number && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "20px 24px" }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                  Shipment Tracking
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", letterSpacing: ".06em", color: "var(--accent)" }}>
                      {order.tracking_number}
                    </p>
                    {order.tracking_carrier && (
                      <p style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 4, fontFamily: "var(--font-hanken)" }}>
                        via {order.tracking_carrier}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={copyTracking}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "1px solid var(--line-2)",
                      background: copied ? "#4ade8020" : "var(--bg)", color: copied ? "#4ade80" : "var(--muted)",
                      fontFamily: "var(--font-space-mono)", fontSize: ".72rem", letterSpacing: ".08em",
                      textTransform: "uppercase", cursor: "pointer", transition: "all .2s",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
                  Order Items
                </p>
              </div>
              <div>
                {(order.items ?? []).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "16px 24px", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid var(--line)" }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 2 }}>{item.productName}</p>
                      <p style={{ fontSize: ".72rem", color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{item.variantLabel}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: ".9rem", fontFamily: "var(--font-hanken)" }}>{formatPrice(item.price * item.quantity)}</p>
                      <p style={{ fontSize: ".75rem", color: "var(--muted)" }}>× {item.quantity} @ {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem" }}>
                    <span style={{ color: "var(--muted)" }}>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem" }}>
                      <span style={{ color: "var(--muted)" }}>Discount</span>
                      <span style={{ color: "var(--accent)" }}>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem" }}>
                    <span style={{ color: "var(--muted)" }}>
                      Shipping Method ({SHIPPING_METHOD_LABELS[order.shipping_method] ?? order.shipping_method})
                    </span>
                    <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.05rem", paddingTop: 10, borderTop: "1px solid var(--line)", marginTop: 4 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: "var(--font-hanken)", color: "var(--accent)" }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>


    </div>
  );
}
