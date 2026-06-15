"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingCart, ArrowRight, Trash2, Truck, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { getShippingOptions } from "@/lib/commerce";
import { useSettings } from "@/components/providers/SettingsProvider";
import QuantityStepper from "@/components/ui/QuantityStepper";

export default function MiniCart() {
  const router = useRouter();
  const settings = useSettings();
  const { isOpen, closeCart, items, removeItem, updateQty, subtotal, promoDiscount, promoCode, applyPromo, removePromo } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const sub = subtotal();
  const discount = sub * promoDiscount;
  const afterDiscount = sub - discount;
  const shipping = getShippingOptions("PK", afterDiscount, settings.shipping)[0]?.price ?? 0;
  const total = afterDiscount + shipping;

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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70]"
          style={{ background: "rgba(10, 11, 13,.7)", backdropFilter: "blur(6px)" }}
          onClick={closeCart}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-[80] flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--line-2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
            <h2 className="text-[1.1rem]" style={{ fontFamily: "var(--font-anton)" }}>YOUR CART</h2>
            {items.length > 0 && (
              <span
                className="text-[.6rem] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
              >
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl grid place-items-center" style={{ background: "var(--surface-2)" }}>
                <ShoppingCart className="w-7 h-7" style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="font-semibold">Cart is empty</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Add some products to get started</p>
              </div>
              <button
                onClick={() => { closeCart(); router.push("/shop"); }}
                className="px-5 py-2.5 rounded-[11px] text-sm font-semibold transition-all cursor-pointer"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variant.sku}`} className="flex items-start gap-3">
                  <div
                    className="relative w-[60px] h-[60px] rounded-[10px] overflow-hidden flex-shrink-0"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <Image
                      src={imgErrors[`${item.product.id}-${item.variant.sku}`] ? "/placeholder.svg" : item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      onError={() => setImgErrors((prev) => ({ ...prev, [`${item.product.id}-${item.variant.sku}`]: true }))}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1 leading-tight">{item.product.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.variant.label}</p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <QuantityStepper
                        value={item.quantity}
                        max={item.product.stock ?? 99}
                        onChange={(v) => updateQty(item.product.id, item.variant.sku, v)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold leading-none" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: "var(--text)" }}>
                          {formatPrice(item.variant.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id, item.variant.sku)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover-danger transition-colors hover:bg-[rgba(239,68,68,0.12)]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
            {/* Promo code */}
            <div className="mb-3">
              {promoDiscount > 0 ? (
                <div className="flex items-center justify-between text-sm" style={{ color: "var(--accent)" }}>
                  <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> {promoCode}</span>
                  <button
                    onClick={() => { removePromo(); setPromoMsg(null); setPromoInput(""); }}
                    className="text-xs cursor-pointer hover:text-[var(--text)] transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-[9px] text-xs outline-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
                    onKeyDown={(e) => e.key === "Enter" && handlePromo()}
                  />
                  <button
                    onClick={handlePromo}
                    disabled={promoLoading}
                    className="flex-shrink-0 px-3 py-2 rounded-[9px] text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--line-2)" }}
                  >
                    {promoLoading ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {promoMsg && (
                <p className="text-[.65rem] mt-1" style={{ color: promoMsg.ok ? "var(--accent)" : "#ef4444" }}>
                  {promoMsg.text}
                </p>
              )}
            </div>

            {promoDiscount > 0 && (
              <div className="flex items-center justify-between text-sm mb-1" style={{ color: "var(--accent)" }}>
                <span>Discount</span>
                <span className="font-bold">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                <Truck className="w-3.5 h-3.5" /> Est. Shipping (PK)
              </span>
              <span className="font-semibold" style={{ color: shipping === 0 ? "#4ade80" : "var(--text)" }}>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-[.65rem] mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                Add {formatPrice(settings.shipping.freeThreshold - afterDiscount)} for free shipping
              </p>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Total</span>
              <span className="text-[1.4rem] leading-none" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: "var(--text)" }}>
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { closeCart(); router.push("/checkout"); }}
                className="w-full py-3.5 rounded-[11px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                Checkout <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full text-center text-sm py-2 transition-colors"
                style={{ color: "var(--muted)" }}
              >
                View full cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
