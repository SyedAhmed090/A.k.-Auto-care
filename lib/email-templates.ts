// ── Email templates: DB-backed transactional copy (subject + message body) ──
// Order-status emails read their subject/message from the `email_templates`
// table (key = template key) and are editable from the admin Email Templates
// page. While a row is absent the app falls back to DEFAULT_TEMPLATES below, so
// behaviour is unchanged until something is edited (mirrors lib/settings.ts).
//
// The stored `body` is just the message paragraph(s); the branded HTML shell is
// applied at send time by renderEmail(), so editing stays simple and on-brand.
// Supported variables in subject/body: {{name}} {{order_id}} {{total}}
// {{tracking_number}} {{status}}.
import { createAdminClient } from "@/utils/supabase/admin";

export type EmailTemplateKey =
  | "status_confirmed"
  | "status_processing"
  | "status_shipped"
  | "status_delivered"
  | "status_cancelled"
  | "status_refunded";

export type EmailTemplate = { subject: string; body: string };

// Friendly labels for the admin UI (order preserved).
export const TEMPLATE_META: { key: EmailTemplateKey; label: string }[] = [
  { key: "status_confirmed",  label: "Order confirmed" },
  { key: "status_processing", label: "Order processing" },
  { key: "status_shipped",    label: "Order shipped" },
  { key: "status_delivered",  label: "Order delivered" },
  { key: "status_cancelled",  label: "Order cancelled" },
  { key: "status_refunded",   label: "Order refunded" },
];

export const DEFAULT_TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  status_confirmed: {
    subject: "Your A.K. Auto Care order is confirmed",
    body: "Great news! We've confirmed your order and it's now being prepared.",
  },
  status_processing: {
    subject: "Your A.K. Auto Care order is being processed",
    body: "Your order is currently being processed and will be dispatched soon.",
  },
  status_shipped: {
    subject: "Your A.K. Auto Care order is on its way",
    body: "Your order is on its way! Tracking number: <strong>{{tracking_number}}</strong>",
  },
  status_delivered: {
    subject: "Your A.K. Auto Care order has been delivered",
    body: "Your order has been delivered. We hope you love your new products!",
  },
  status_cancelled: {
    subject: "Your A.K. Auto Care order has been cancelled",
    body: "Your order has been cancelled. Contact us if you have any questions.",
  },
  status_refunded: {
    subject: "Your A.K. Auto Care order has been refunded",
    body: "Your order has been refunded. Please allow 5–7 business days for the amount to reflect in your account. Contact us if you have any questions.",
  },
};

export type TemplateVars = {
  name?: string;
  order_id?: string;
  total?: string;
  tracking_number?: string;
  status?: string;
};

/** Escape a value for safe interpolation into HTML. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Substitute {{var}} tokens. Unknown / missing vars collapse to "". */
export function interpolate(text: string, vars: TemplateVars): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const v = (vars as Record<string, string | undefined>)[key];
    return v == null ? "" : v;
  });
}

/** Wrap an inner message in the branded A.K. Auto Care email shell. */
export function buildEmailShell(innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <h1 style="font-size:22px;margin-bottom:4px;">A.K. Auto Care</h1>
  <hr style="border:1px solid #eee;margin:16px 0;">
  ${innerHtml}
  <hr style="border:1px solid #eee;margin:16px 0;">
  <p style="font-size:11px;color:#888;">A.K. Auto Care — Premium Car Care Products</p>
</body></html>`;
}

/** Render subject + full HTML for a template + variables. */
export function renderEmail(tpl: EmailTemplate, vars: TemplateVars): { subject: string; html: string } {
  // Subject is a plain-text header — interpolate raw. In the HTML body, escape
  // variable VALUES (customer name etc. are user-controlled) while preserving
  // the template body's own intentional HTML markup.
  const subject = interpolate(tpl.subject, vars);
  const escVars: TemplateVars = Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [k, v == null ? v : escapeHtml(String(v))])
  );
  const greeting = vars.name ? `<p style="font-size:16px;">Hi ${escapeHtml(vars.name)},</p>` : "";
  const message = `<p>${interpolate(tpl.body, escVars)}</p>`;
  const orderLine = vars.order_id ? `<p><strong>Order:</strong> ${escapeHtml(vars.order_id)}</p>` : "";
  const totalLine = vars.total ? `<p><strong>Total:</strong> ${escapeHtml(vars.total)}</p>` : "";
  return { subject, html: buildEmailShell(`${greeting}${message}${orderLine}${totalLine}`) };
}

// ── DB read with short in-process cache (same approach as lib/settings.ts) ──
let cache: Record<string, EmailTemplate> | null = null;
let cacheAt = 0;
const TTL_MS = 30_000;

export function invalidateTemplateCache() {
  cache = null;
  cacheAt = 0;
}

/** All templates, DB values merged over DEFAULT_TEMPLATES. */
export async function getTemplates(): Promise<Record<EmailTemplateKey, EmailTemplate>> {
  const now = Date.now();
  if (!cache || now - cacheAt > TTL_MS) {
    const merged: Record<string, EmailTemplate> = { ...DEFAULT_TEMPLATES };
    try {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("email_templates")
        .select("key, subject, body");
      if (error) throw error;
      for (const row of (data ?? []) as { key: string; subject: string; body: string }[]) {
        if (row.key in DEFAULT_TEMPLATES) merged[row.key] = { subject: row.subject, body: row.body };
      }
    } catch (err) {
      // Table missing / unreachable → defaults only. Non-fatal.
      console.error("[email-templates] load failed, using defaults:", err);
    }
    cache = merged;
    cacheAt = now;
  }
  return cache as Record<EmailTemplateKey, EmailTemplate>;
}

export async function getTemplate(key: EmailTemplateKey): Promise<EmailTemplate> {
  const all = await getTemplates();
  return all[key] ?? DEFAULT_TEMPLATES[key];
}
