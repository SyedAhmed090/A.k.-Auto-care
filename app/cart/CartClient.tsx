"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Trash2, ShoppingCart, ArrowRight, Tag, Truck } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { gstAmount, getShippingOptions } from "@/lib/commerce";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useSettings } from "@/components/providers/SettingsProvider";
import QuantityStepper from "@/components/ui/QuantityStepper";
import CartUpsell from "@/components/product/CartUpsell";

function CartPageInner({ allProducts }: { allProducts: Product[] }) {
  const settings = useSettings();
  const { items, removeItem, updateQty, subtotal, promoCode, promoDiscount, applyPromo, removePromo, clearCart, addItem } = useCartStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("recover");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`/api/cart/recover?token=${encodeURIComponent(token)}`);
        if (!res.ok) return;
        const { cartData } = await res.json();
        if (Array.isArray(cartData)) {
          for (const item of cartData) {
            addItem(item.product, item.variant, item.quantity);
          }
        }
      } catch {
        // silently ignore recovery errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const confirmRef = useRef<HTMLDivElement>(null);
  useFocusTrap(confirmRef, confirmClear, () => setConfirmClear(false));

  const sub = subtotal();
  const discount = sub * promoDiscount;
  const afterDiscount = sub - discount;
  const shipping = getShippingOptions("PK", afterDiscount, settings.shipping)[0]?.price ?? 0;
  const total = afterDiscount + shipping;
  const vat = gstAmount(total, settings.tax.gstRate);
  const gstPct = Math.round(settings.tax.gstRate * 100);
  const freeThreshold = settings.shipping.freeThreshold;

  const handlePromo = async () => {
    if (!promoInput.trim() || promoLoading) return;
    setPromoLoading(true);
    const result = await applyPromo(promoInput);
    setPromoLoading(false);
    setPromoMsg(
      result.valid
        ? { ok: true, text: `Code applied! ${(result.discount * 100).toFixed(0)}% off` }
        : { ok: false, text: result.reason ?? "Invalid code." }
    );
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
          className="btn-accent inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5"
        >
          Browse Products <ArrowRight className="w-[18px] h-[18px]" />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1
          className="uppercase tracking-[.01em] mb-10"
          style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem,5vw,4rem)" }}
        >
          Your Cart{" "}
          <span className="text-[1.8rem]" style={{ color: "var(--muted-2)" }}>
            ({items.reduce((a, i) => a + i.quantity, 0)})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.variant.sku}`}
                className="flex items-center gap-4 rounded-[var(--r)] p-5"
                style={{ border: "1px solid var(--line)", background: "var(--bg-2)" }}
              >
                <div
                  className="relative w-20 h-20 rounded-[10px] overflow-hidden flex-shrink-0 self-start"
                  style={{ background: "var(--surface)" }}
                >
                  <Image
                    src={imgErrors[`${item.product.id}-${item.variant.sku}`] ? "/placeholder.svg" : item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover opacity-70"
                    onError={() => setImgErrors((prev) => ({ ...prev, [`${item.product.id}-${item.variant.sku}`]: true }))}
                  />
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
                  <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                    <QuantityStepper value={item.quantity} max={item.product.stock ?? 99} onChange={(v) => updateQty(item.product.id, item.variant.sku, v)} />
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[1.3rem] leading-none"
                        style={{
                          fontFamily: "var(--font-hanken)",
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id, item.variant.sku)}
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="flex items-center justify-center w-9 h-9 rounded-md cursor-pointer hover-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <div />
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{ border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", background: "rgba(239,68,68,.06)" }}
              >
                <Trash2 className="w-3 h-3" /> Clear cart
              </button>
            </div>
            <CartUpsell allProducts={allProducts} />
          </div>

          {/* Clear cart confirmation */}
          {confirmClear && (
            <>
              <div className="fixed inset-0 z-50" style={{ background: "var(--scrim)" }} onClick={() => setConfirmClear(false)} />
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                onClick={() => setConfirmClear(false)}
              >
                <div
                  ref={confirmRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Confirm clear cart"
                  className="w-full max-w-sm rounded-[20px] p-6 text-center"
                  style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-8 h-8 mx-auto mb-3" style={{ color: "#ef4444" }} />
                  <h3 className="text-lg font-bold mb-2">Clear your cart?</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 py-3 rounded-[11px] text-sm font-semibold cursor-pointer transition-all"
                      style={{ border: "1px solid var(--line-2)", color: "var(--text)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { clearCart(); setConfirmClear(false); }}
                      className="flex-1 py-3 rounded-[11px] text-sm font-semibold cursor-pointer transition-all"
                      style={{ background: "#ef4444", color: "#fff" }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Summary */}
          <div className="lg:col-span-1">
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
                {((): Array<{ label: string; value: string; accent?: boolean; green?: boolean }> => [
                  { label: "Subtotal", value: formatPrice(sub) },
                  ...(promoDiscount > 0 ? [{ label: `Discount (${promoCode})`, value: `-${formatPrice(discount)}`, accent: true }] : []),
                  { label: "Est. Shipping (PK)", value: shipping === 0 ? "FREE" : formatPrice(shipping), green: shipping === 0 },
                ])().map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span style={{ color: "var(--muted)" }}>{row.label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: row.accent ? "var(--accent)" : row.green ? "#4ade80" : "var(--text)" }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
                {shipping > 0 && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    <Truck className="w-3.5 h-3.5 flex-shrink-0" /> Add {formatPrice(freeThreshold - afterDiscount)} for free shipping
                  </p>
                )}
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <span className="font-semibold">Total</span>
                  <span
                    className="text-[1.6rem] leading-none"
                    style={{
                      fontFamily: "var(--font-hanken)",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-right text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  Incl. GST ({gstPct}%): {formatPrice(vat)}
                </p>
                <p className="text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  Final shipping &amp; method selected at checkout
                </p>
              </div>

              <div className="mb-5">
                <p
                  className="flex items-center gap-1.5 text-[.72rem] tracking-[.14em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
                >
                  <Tag className="w-3.5 h-3.5 flex-shrink-0" /> Promo Code
                </p>
                {promoDiscount > 0 ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[.82rem]" style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}>
                      {promoCode} applied
                    </span>
                    <button
                      onClick={() => { removePromo(); setPromoMsg(null); setPromoInput(""); }}
                      className="text-[.75rem] transition-colors cursor-pointer hover:text-[var(--text)]"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}

                        className="flex-1 min-w-0 px-3 py-2.5 rounded-[11px] text-sm outline-none"
                        style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
                        onKeyDown={(e) => e.key === "Enter" && handlePromo()}
                      />
                      <button
                        onClick={handlePromo}
                        disabled={promoLoading || !promoInput.trim()}
                        aria-busy={promoLoading}
                        className="flex-shrink-0 px-4 py-2.5 rounded-[11px] text-sm font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-2)]"
                        style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--line-2)" }}
                      >
                        {promoLoading ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                            </svg>
                            Applying
                          </span>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {promoMsg && (
                      <p className="text-xs mt-1.5" style={{ color: promoMsg.ok ? "var(--accent)" : "#ef4444" }}>
                        {promoMsg.text}
                      </p>
                    )}
                  </>
                )}
              </div>

              <Link
                href="/checkout"
                className="btn-accent w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
              >
                Checkout <ArrowRight className="w-[18px] h-[18px]" />
              </Link>
              <Link
                href="/shop"
                className="block text-center text-sm mt-3 transition-colors hover:text-[var(--accent)]"
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

export default function CartClient({ allProducts }: { allProducts: Product[] }) {
  return (
    <Suspense>
      <CartPageInner allProducts={allProducts} />
    </Suspense>
  );
}
