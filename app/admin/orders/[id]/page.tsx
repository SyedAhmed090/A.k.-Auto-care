import { createAdminClient } from "@/utils/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderActions from "./OrderActions";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
  shipped: "#06b6d4", delivered: "#4ade80", cancelled: "#ef4444", refunded: "#9ca3af",
};

async function getOrder(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const displayId = `AK-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin/orders" className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>← Orders</Link>
        <span style={{ color: "var(--line-2)" }}>/</span>
        <h1 className="text-[1.6rem] uppercase" style={{ fontFamily: "var(--font-anton)" }}>{displayId}</h1>
        <span className="text-[.65rem] font-bold px-2.5 py-1 rounded-full uppercase" style={{ background: `${STATUS_COLORS[order.status] ?? "#9ca3af"}22`, color: STATUS_COLORS[order.status] ?? "#9ca3af", fontFamily: "var(--font-space-mono)" }}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <h2 className="px-5 py-4 text-sm font-semibold uppercase border-b" style={{ borderColor: "var(--line)", fontFamily: "var(--font-space-mono)" }}>Items</h2>
            <div className="divide-y" style={{ borderColor: "var(--line)" }}>
              {(order.items ?? []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold">{item.productName}</p>
                    <p className="text-[.72rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{item.variantLabel} · SKU: {item.variantSku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-hanken)" }}>{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-[.72rem]" style={{ color: "var(--muted)" }}>× {item.quantity} @ {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t space-y-2 text-sm" style={{ borderColor: "var(--line)" }}>
              {[
                { l: "Subtotal", v: formatPrice(order.subtotal) },
                ...(order.discount > 0 ? [{ l: `Discount (${order.promo_code})`, v: `-${formatPrice(order.discount)}`, accent: true }] : []),
                { l: `Shipping (${order.shipping_method})`, v: order.shipping === 0 ? "FREE" : formatPrice(order.shipping) },
              ].map((row) => (
                <div key={row.l} className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>{row.l}</span>
                  <span style={{ color: (row as any).accent ? "var(--accent)" : "var(--text)" }}>{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold border-t" style={{ borderColor: "var(--line)" }}>
                <span>Total</span>
                <span style={{ fontFamily: "var(--font-hanken)", fontSize: "1.2rem" }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-[16px] p-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <h2 className="text-sm font-semibold uppercase mb-4 border-b pb-3" style={{ borderColor: "var(--line)", fontFamily: "var(--font-space-mono)" }}>Customer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { l: "Name", v: `${order.first_name} ${order.last_name}` },
                { l: "Phone / WhatsApp", v: order.phone ?? "—" },
                { l: "Email", v: order.email },
                { l: "Payment", v: order.payment_method?.toUpperCase() ?? "—" },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[.65rem] tracking-[.12em] uppercase mb-0.5" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{l}</p>
                  <p className="font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-[16px] p-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <h2 className="text-sm font-semibold uppercase mb-4 border-b pb-3" style={{ borderColor: "var(--line)", fontFamily: "var(--font-space-mono)" }}>Delivery Address</h2>
            <p className="text-sm">{order.address}</p>
            <p className="text-sm">{order.city}, {order.postcode}</p>
            <p className="text-sm">{order.country}</p>
          </div>
        </div>

        {/* Right column — actions */}
        <div>
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  );
}
