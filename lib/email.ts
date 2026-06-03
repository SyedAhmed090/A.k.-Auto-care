const RESEND_URL = "https://api.resend.com/emails";

type StatusKey = "confirmed" | "shipped" | "delivered" | "cancelled";

const SUBJECTS: Record<StatusKey, string> = {
  confirmed: "Your A.K. Auto Care order is confirmed",
  shipped:   "Your A.K. Auto Care order is on its way",
  delivered: "Your A.K. Auto Care order has been delivered",
  cancelled: "Your A.K. Auto Care order has been cancelled",
};

function buildHtml(status: StatusKey, o: { first_name: string; id: string; tracking_number?: string | null; total: number }) {
  const orderId = `AK-${o.id.slice(0, 8).toUpperCase()}`;
  const msgs: Record<StatusKey, string> = {
    confirmed: "Great news! We've confirmed your order and it's now being prepared.",
    shipped:   `Your order is on its way!${o.tracking_number ? ` Tracking number: <strong>${o.tracking_number}</strong>` : ""}`,
    delivered: "Your order has been delivered. We hope you love your new products!",
    cancelled: "Your order has been cancelled. Contact us if you have any questions.",
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
  order: { id: string; email: string; first_name: string; tracking_number?: string | null; total: number },
  status: string
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const notify: StatusKey[] = ["confirmed", "shipped", "delivered", "cancelled"];
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
