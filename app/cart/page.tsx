"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Button from "@/components/ui/Button";

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
    setPromoMsg(ok ? { ok: true, text: `Code applied! ${(promoDiscount * 100).toFixed(0)}% off` } : { ok: false, text: "Invalid promo code." });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-black text-[#0f0f0f] mb-2">Your cart is empty</h1>
        <p className="text-gray-400 mb-6">Add some products to continue shopping.</p>
        <Link href="/shop">
          <Button size="lg">Browse Products <ArrowRight className="w-5 h-5" /></Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-[#0f0f0f] mb-8">
          Your Cart <span className="text-gray-300 text-2xl font-normal">({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variant.sku}`} className="bg-white rounded-2xl p-4 sm:p-5 flex gap-4 shadow-sm">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-bold text-[#0f0f0f] hover:text-[#e8320a] transition-colors leading-tight line-clamp-2">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.variant.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.variant.price)} each</p>
                  <div className="flex items-center justify-between mt-3">
                    <QuantityStepper value={item.quantity} onChange={(v) => updateQty(item.product.id, item.variant.sku, v)} />
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg text-[#0f0f0f]">
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                      <button onClick={() => removeItem(item.product.id, item.variant.sku)} className="text-gray-300 hover:text-red-500 transition-colors p-1" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-2">
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-black text-lg text-[#0f0f0f] mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatPrice(sub)}</span></div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({promoCode})</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-600 font-semibold" : "font-semibold"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Add {formatPrice(75 - sub)} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-black text-[#0f0f0f]">Total</span>
                  <span className="font-black text-xl text-[#0f0f0f]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo */}
              {!promoDiscount && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Promo Code
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter code…"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8320a]"
                      onKeyDown={(e) => e.key === "Enter" && handlePromo()}
                    />
                    <button onClick={handlePromo} className="px-4 py-2 bg-[#0f0f0f] text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      Apply
                    </button>
                  </div>
                  {promoMsg && (
                    <p className={`text-xs mt-1.5 ${promoMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                      {promoMsg.text}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Try: AKCARE10, DETAIL20, LAUNCH15</p>
                </div>
              )}

              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-[#0f0f0f] mt-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
