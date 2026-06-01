"use client";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Button from "@/components/ui/Button";

export default function MiniCart() {
  const { isOpen, closeCart, items, removeItem, updateQty, subtotal, promoDiscount } =
    useCartStore();
  const sub = subtotal();
  const discount = sub * promoDiscount;
  const total = sub - discount;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-[80] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#e8320a]" />
            <h2 className="font-black text-[#0f0f0f] text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="text-xs bg-[#e8320a] text-white px-2 py-0.5 rounded-full font-bold">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-[#0f0f0f]">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add some products to get started</p>
              </div>
              <Button onClick={closeCart} size="sm">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant.sku}`}
                  className="flex gap-3"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0f0f0f] leading-tight line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.variant.label}</p>
                    <div className="flex items-center justify-between mt-2">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(v) =>
                          updateQty(item.product.id, item.variant.sku, v)
                        }
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#0f0f0f]">
                          {formatPrice(item.variant.price * item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.product.id, item.variant.sku)
                          }
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
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
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-600 font-medium">Discount</span>
                <span className="text-emerald-600 font-bold">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-black text-xl text-[#0f0f0f]">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Shipping calculated at checkout
            </p>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  closeCart();
                  window.location.href = "/checkout";
                }}
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </Button>
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-center text-sm font-semibold text-gray-500 hover:text-[#0f0f0f] transition-colors py-1"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
