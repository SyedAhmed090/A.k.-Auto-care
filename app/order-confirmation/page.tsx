import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createAdminClient } from "@/utils/supabase/admin";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: "noindex",
};

async function getOrder(id: string) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("orders").select().eq("id", id).single();
    return data;
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;

  const displayId = orderId ? `AK-${orderId.slice(0, 8).toUpperCase()}` : "AK-XXXXXX";
  const total = order?.total ? formatPrice(order.total) : "—";
  const name = order ? `${order.first_name} ${order.last_name}` : null;
  // Redact email — show only first char + *** + domain to avoid exposing PII
  // to anyone who might guess the order UUID.
  const redactedEmail = order?.email
    ? (() => {
        const [local, domain] = order.email.split("@");
        return `${local[0]}***@${domain}`;
      })()
    : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-6"
          style={{ background: "rgba(232,160,32,.1)", border: "1px solid rgba(232,160,32,.2)" }}
        >
          <CheckCircle className="w-9 h-9" style={{ color: "var(--accent)" }} />
        </div>

        <h1
          className="uppercase tracking-[.01em] mb-2"
          style={{ fontFamily: "var(--font-anton)", fontSize: "2.2rem" }}
        >
          Order Confirmed!
        </h1>
        <p className="mb-8 text-[.97rem]" style={{ color: "var(--muted)" }}>
          {name ? `Thank you, ${order.first_name}.` : "Thank you."} We&apos;ll be in touch shortly.
        </p>

        <div
          className="rounded-[20px] p-6 mb-8 text-left w-full"
          style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
        >
          <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1rem" }}>
            <Package className="w-[18px] h-[18px] flex-shrink-0" style={{ color: "var(--accent)" }} />
            <h2 className="uppercase" style={{ fontFamily: "var(--font-anton)", fontSize: "1.2rem" }}>Order Details</h2>
          </div>
          <div className="text-sm">
            {[
              { label: "Order Number", value: displayId, mono: true },
              { label: "Total", value: total },
              ...(redactedEmail ? [{ label: "Email", value: redactedEmail }] : []),
              { label: "Estimated Delivery", value: "3–5 business days" },
              { label: "Status", value: "Processing", accent: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)" }}>{row.label}</span>
                <span
                  className="font-semibold text-right"
                  style={{
                    color: (row as any).accent ? "var(--accent)" : "var(--text)",
                    fontFamily: (row as any).mono ? "var(--font-space-mono)" : "inherit",
                    fontSize: (row as any).mono ? ".78rem" : "inherit",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {order?.items && Array.isArray(order.items) && order.items.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                Items ordered
              </p>
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-5 h-5 rounded-full grid place-items-center text-[.6rem] font-bold flex-shrink-0"
                      style={{ background: "var(--muted)", color: "var(--bg)", fontFamily: "var(--font-space-mono)" }}
                    >
                      {item.quantity}
                    </span>
                    <span className="truncate">{item.productName}</span>
                  </div>
                  <span className="whitespace-nowrap flex-shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: ".78rem" }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/shop"
          className="w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--accent)", color: "#000", display: "flex" }}
        >
          Continue Shopping <ArrowRight className="w-[18px] h-[18px]" />
        </Link>
        <Link href="/" className="block mt-3 text-sm transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
