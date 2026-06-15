interface LowStockProduct {
  name: string;
  slug: string;
  stock: number | null;
  in_stock: boolean;
}

interface LowStockEmailProps {
  products: LowStockProduct[];
  threshold: number;
  siteUrl: string;
}

/** Build the daily low-stock digest email (dark theme, matches the brand). */
export function buildLowStockHtml({ products, threshold, siteUrl }: LowStockEmailProps): string {
  const rows = products
    .map((p) => {
      const qty = p.stock === null ? "—" : String(p.stock);
      const state = !p.in_stock || p.stock === 0 ? "Out of stock" : "Low";
      const stateColor = !p.in_stock || p.stock === 0 ? "#ef4444" : "#eab308";
      return `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1f2329;color:#ffffff;font-size:14px;">${p.name}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1f2329;color:#ffffff;font-size:14px;font-weight:700;text-align:center;">${qty}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1f2329;color:${stateColor};font-size:13px;font-weight:600;text-align:right;">${state}</td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;background:#0a0b0d;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px;">Low stock alert</h1>
    <p style="color:#9aa0a6;font-size:14px;margin:0 0 24px;">
      ${products.length} product${products.length === 1 ? "" : "s"} at or below ${threshold} unit${threshold === 1 ? "" : "s"}.
    </p>
    <table style="width:100%;border-collapse:collapse;background:#111316;border:1px solid #1f2329;border-radius:10px;overflow:hidden;">
      <thead>
        <tr>
          <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:11px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid #1f2329;">Product</th>
          <th style="padding:10px 14px;text-align:center;color:#6b7280;font-size:11px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid #1f2329;">Stock</th>
          <th style="padding:10px 14px;text-align:right;color:#6b7280;font-size:11px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid #1f2329;">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <a href="${siteUrl}/admin/inventory?lowstock=1"
       style="display:inline-block;margin-top:24px;background:#4fa8e6;color:#000000;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px;">
      Review inventory
    </a>
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0;">A.K. Auto Care · automated daily digest</p>
  </div>
</body>
</html>`;
}
