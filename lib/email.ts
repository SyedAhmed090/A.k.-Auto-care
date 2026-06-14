const RESEND_URL = "https://api.resend.com/emails";

type StatusKey = "confirmed" | "shipped" | "delivered" | "cancelled" | "processing" | "refunded";

const SUBJECTS: Record<StatusKey, string> = {
  confirmed:  "Your A.K. Auto Care order is confirmed",
  processing: "Your A.K. Auto Care order is being processed",
  shipped:    "Your A.K. Auto Care order is on its way",
  delivered:  "Your A.K. Auto Care order has been delivered",
  cancelled:  "Your A.K. Auto Care order has been cancelled",
  refunded:   "Your A.K. Auto Care order has been refunded",
};

function buildHtml(status: StatusKey, o: { first_name: string; id: string; tracking_number?: string | null; total: number }) {
  const orderId = `AK-${o.id.slice(0, 8).toUpperCase()}`;
  const msgs: Record<StatusKey, string> = {
    confirmed:  "Great news! We've confirmed your order and it's now being prepared.",
    processing: "Your order is currently being processed and will be dispatched soon.",
    shipped:    `Your order is on its way!${o.tracking_number ? ` Tracking number: <strong>${o.tracking_number}</strong>` : ""}`,
    delivered:  "Your order has been delivered. We hope you love your new products!",
    cancelled:  "Your order has been cancelled. Contact us if you have any questions.",
    refunded:   "Your order has been refunded. Please allow 5–7 business days for the amount to reflect in your account. Contact us if you have any questions.",
  };
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <h1 style="font-size:22px;margin-bottom:4px;">A.K. Auto Care</h1>
  <hr style="border:1px solid #eee;margin:16px 0;">
  <p style="font-size:16px;">Hi ${o.first_name},</p>
  <p>${msgs[status]}</p>
  <p><strong>Order:</strong> ${orderId}</p>
  <p><strong>Total:</strong> Rs ${o.total.toLocaleString("en-PK")}</p>
  <hr style="border:1px solid #eee;margin:16px 0;">
  <p style="font-size:11px;color:#888;">A.K. Auto Care — Premium Car Care Products</p>
</body></html>`;
}

export async function sendStatusEmail(
  order: { id: string; email: string; first_name: string; tracking_number?: string | null; tracking_carrier?: string | null; total: number },
  status: string
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const notify: StatusKey[] = ["confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
  if (!notify.includes(status as StatusKey)) return;

  const s = status as StatusKey;
  await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_EMAIL_FROM ?? "orders@akautocare.pk",
      to: order.email,
      subject: SUBJECTS[s],
      html: buildHtml(s, order),
    }),
  }).catch(err => console.error("[email] send failed:", err));
}

// ---------------------------------------------------------------------------
// Order confirmation email (sent immediately at checkout)
// ---------------------------------------------------------------------------

interface OrderEmailData {
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  items: { productName: string; variantLabel: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingMethod: string;
  paymentMethod: string;
  city: string;
  address: string;
}

function fmt(n: number) {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

export function buildOrderConfirmationHtml(d: OrderEmailData): string {
  const orderId = d.orderId.slice(0, 8).toUpperCase();
  const rows = d.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ccc">${i.productName} — ${i.variantLabel}</td>
          <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:center;color:#ccc">${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;color:#ccc">${fmt(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="background:#111;color:#fff;font-family:sans-serif;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto">
    <div style="background:#4fa8e6;padding:16px 24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#000;font-size:1.4rem">Order Confirmed ✓</h1>
    </div>
    <div style="background:#1a1a1a;padding:24px;border-radius:0 0 12px 12px">
      <p style="color:#aaa">Hi ${d.firstName}, thank you for your order!</p>
      <p style="color:#aaa">Order ID: <strong style="color:#4fa8e6">#${orderId}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr>
            <th style="text-align:left;color:#888;font-size:.8rem;padding-bottom:8px;border-bottom:1px solid #333">Product</th>
            <th style="text-align:center;color:#888;font-size:.8rem;padding-bottom:8px;border-bottom:1px solid #333">Qty</th>
            <th style="text-align:right;color:#888;font-size:.8rem;padding-bottom:8px;border-bottom:1px solid #333">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="text-align:right;padding-top:12px">
        <p style="color:#888;margin:4px 0">Subtotal: ${fmt(d.subtotal)}</p>
        ${d.discount > 0 ? `<p style="color:#4fa8e6;margin:4px 0">Discount: -${fmt(d.discount)}</p>` : ""}
        <p style="color:#888;margin:4px 0">Shipping: ${d.shipping === 0 ? "FREE" : fmt(d.shipping)}</p>
        <p style="color:#fff;font-size:1.2rem;font-weight:700;margin:8px 0">Total: ${fmt(d.total)}</p>
      </div>
      <hr style="border:none;border-top:1px solid #333;margin:16px 0"/>
      <p style="color:#aaa;font-size:.85rem">
        Payment: <strong style="color:#fff">${d.paymentMethod.toUpperCase()}</strong><br/>
        Delivery to: ${d.address}, ${d.city}
      </p>
      ${d.paymentMethod !== "cod" ? `<p style="color:#4fa8e6;font-size:.85rem">Please send your payment screenshot to our WhatsApp to confirm your order.</p>` : ""}
      <p style="color:#555;font-size:.75rem;margin-top:24px">A.K. Auto Care · Karachi, Pakistan · hello@akautocare.pk</p>
    </div>
  </div>
</body></html>`;
}
