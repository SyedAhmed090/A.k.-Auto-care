interface CartItem {
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AbandonedCartEmailProps {
  firstName?: string;
  email: string;
  cartItems: CartItem[];
  recoveryUrl: string;
}

export function buildAbandonedCartHtml({
  firstName,
  email,
  cartItems,
  recoveryUrl,
}: AbandonedCartEmailProps): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const itemRows = cartItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${
                  item.image
                    ? `<td width="56" valign="top" style="padding-right:12px;">
                        <img src="${item.image}" alt="${item.productName}" width="56" height="56"
                          style="width:56px;height:56px;object-fit:cover;border-radius:6px;display:block;border:1px solid #2a2a2a;" />
                      </td>`
                    : ""
                }
                <td valign="middle">
                  <div style="color:#ffffff;font-size:14px;font-weight:600;line-height:1.3;">${item.productName}</div>
                  <div style="color:#888888;font-size:12px;margin-top:2px;">${item.variantLabel}</div>
                  <div style="color:#4fa8e6;font-size:13px;margin-top:4px;">Rs ${(item.price * item.quantity).toLocaleString("en-PK")} &nbsp;<span style="color:#666;font-weight:400;">× ${item.quantity}</span></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You left something behind...</title>
</head>
<body style="margin:0;padding:0;background:#0a0b0d;font-family:Arial,Helvetica,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0a0b0d;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">

          <tr>
            <td style="background:#0a0b0d;padding:24px 32px 0 32px;border-radius:12px 12px 0 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">A.K. Auto Care</div>
                    <div style="color:#888888;font-size:12px;margin-top:2px;letter-spacing:1px;text-transform:uppercase;">Premium Car Care Products</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;">
                    <div style="height:2px;background:#4fa8e6;border-radius:1px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#111111;padding:32px 32px 24px 32px;">
              <h1 style="margin:0 0 8px 0;color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">
                You left something behind...
              </h1>
              <p style="margin:0 0 24px 0;color:#aaaaaa;font-size:15px;line-height:1.5;">
                ${greeting} Your cart is waiting for you. Complete your order before your items sell out.
              </p>

              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:#0a0b0d;border-radius:8px;padding:0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${itemRows}
                      <tr>
                        <td style="padding-top:16px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="color:#888888;font-size:13px;">Estimated Total</td>
                              <td align="right" style="color:#ffffff;font-size:16px;font-weight:700;">
                                Rs ${totalAmount.toLocaleString("en-PK")}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${recoveryUrl}"
                      style="display:inline-block;background:#4fa8e6;color:#000000;font-size:15px;font-weight:700;
                             text-decoration:none;padding:14px 40px;border-radius:6px;letter-spacing:0.3px;">
                      Complete Your Order &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;color:#666666;font-size:12px;text-align:center;line-height:1.5;">
                This link expires in 48 hours.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#0a0b0d;padding:20px 32px;border-top:1px solid #1e1e1e;border-radius:0 0 12px 12px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color:#555555;font-size:11px;line-height:1.6;">
                    <div>A.K. Auto Care &mdash; Karachi, Pakistan</div>
                    <div style="margin-top:4px;">
                      You received this email because you added items to your cart at
                      <a href="https://akautocare.pk" style="color:#4fa8e6;text-decoration:none;">akautocare.pk</a>.
                      If you no longer wish to receive these reminders, simply ignore this email or
                      <a href="mailto:hello@akautocare.pk?subject=Unsubscribe&body=Please unsubscribe ${encodeURIComponent(email)} from abandoned cart emails."
                        style="color:#555555;">unsubscribe</a>.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
