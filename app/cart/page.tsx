"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingCart, ArrowRight, Tag, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import QuantityStepper from "@/components/ui/QuantityStepper";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, promoCode, promoDiscount, applyPromo, clearCart } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const sub = subtotal();
  const discount = sub * promoDiscount;
  const shipping = sub >= 75 ? 0 : 4.99;
  const total = sub - discount + shipping;

  const handlePromo = () => {
    if (!promoInput.trim()) return;
    const ok = applyPromo(promoInput);
    setPromoMsg(ok ? { ok: true, text: `Code applied! ${(promoDiscount * 100).toFixed(0)}% off` } : { ok: false, text: "Invalid code." });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="w-20 h-20 rounded-[20px] grid place-items-center mb-6" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <ShoppingCart className="w-8 h-8" style={{ color: "var(--muted)" }} />
        </div>
        <h1 className="text-[2rem] mb-2 uppercase" style={{ fontFamily: "var(--font-anton)" }}>Cart is empty</h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>Add some products to continue shopping.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          Browse Products <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-[1280px] mx-auto px-8 py-14">
        <h1
          className="uppercase tracking-[.01em] mb-10"
          style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem,5vw,4rem)" }}
        >
          Your Cart{" "}
          <span className="text-[1.8rem]" style={{ color: "var(--muted-2)" }}>
            ({items.reduce((a, i) => a + i.quantity, 0)})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.variant.sku}`}
                className="flex gap-4 rounded-[var(--r)] p-5"
                style={{ border: "1px solid var(--line)", background: "var(--bg-2)" }}
              >
                <div
                  className="relative w-20 h-20 rounded-[10px] overflow-hidden flex-shrink-0"
                  style={{ background: "var(--surface)" }}
                >
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover opacity-70" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold leading-tight line-clamp-2 hover:text-[var(--accent)] transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    {item.variant.label} · {formatPrice(item.variant.price)} each
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <QuantityStepper value={item.quantity} onChange={(v) => updateQty(item.product.id, item.variant.sku, v)} />
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[1.3rem]"
                        style={{
                          fontFamily: "var(--font-anton)",
                          background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id, item.variant.sku)}
                        className="transition-colors cursor-pointer"
                        style={{ color: "var(--muted-2)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-2)")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={clearCart}
              className="text-xs transition-colors cursor-pointer"
              style={{ color: "var(--muted-2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-2)")}
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div>
            <div
              className="rounded-[var(--r)] p-6 sticky top-28"
              style={{ border: "1px solid var(--line)", background: "var(--bg-2)" }}
            >
              <h2
                className="uppercase mb-5"
                style={{ fontFamily: "var(--font-anton)", fontSize: "1.4rem" }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 text-sm mb-5">
                {[
                  { label: "Subtotal", value: formatPrice(sub) },
                  ...(promoDiscount > 0 ? [{ label: `Discount (${promoCode})`, value: `-${formatPrice(discount)}`, accent: true }] : []),
                  { label: "Shipping", value: shipping === 0 ? "FREE" : formatPrice(shipping), green: shipping === 0 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span style={{ color: "var(--muted)" }}>{row.label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: (row as any).accent ? "var(--accent)" : (row as any).green ? "var(--accent)" : "var(--text)" }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
                {shipping > 0 && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
                    <Truck className="w-3.5 h-3.5" /> Add {formatPrice(75 - sub)} for free shipping
                  </p>
                )}
                <div
                  className="flex justify-between pt-3"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <span className="font-semibold">Total</span>
                  <span
                    className="text-[1.6rem]"
                    style={{
                      fontFamily: "var(--font-anton)",
                      background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {!promoDiscount && (
                <div className="mb-5">
                  <p
                    className="flex items-center gap-1.5 text-[.72rem] tracking-[.14em] uppercase mb-2"
                    style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
                  >
                    <Tag className="w-3.5 h-3.5" /> Promo Code
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter code…"
                      className="flex-1 px-3 py-2.5 rounded-[11px] text-sm outline-none"
                      style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
                      onKeyDown={(e) => e.key === "Enter" && handlePromo()}
                    />
                    <button
                      onClick={handlePromo}
                      className="px-4 py-2.5 rounded-[11px] text-sm font-bold cursor-pointer transition-all"
                      style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--line-2)" }}
                    >
                      Apply
                    </button>
                  </div>
                  {promoMsg && (
                    <p className="text-xs mt-1.5" style={{ color: promoMsg.ok ? "var(--accent)" : "#ef4444" }}>
                      {promoMsg.text}
                    </p>
                  )}
                  <p className="text-[.65rem] mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
                    Try: AKCARE10, DETAIL20, LAUNCH15
                  </p>
                </div>
              )}

              <Link
                href="/checkout"
                className="w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "#000", display: "flex" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-press)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
              >
                Checkout <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                href="/shop"
                className="block text-center text-sm mt-3 transition-colors"
                style={{ color: "var(--muted)" }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
