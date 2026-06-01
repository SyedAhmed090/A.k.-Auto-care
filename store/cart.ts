"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Variant } from "@/data/products";

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  promoDiscount: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variant: Variant, qty?: number) => void;
  removeItem: (productId: string, variantSku: string) => void;
  updateQty: (productId: string, variantSku: string, qty: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => boolean;
  itemCount: () => number;
  subtotal: () => number;
}

const PROMO_CODES: Record<string, number> = {
  AKCARE10: 0.1,
  DETAIL20: 0.2,
  LAUNCH15: 0.15,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: "",
      promoDiscount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, variant, qty = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product.id === product.id && i.variant.sku === variant.sku
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.variant.sku === variant.sku
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, variant, quantity: qty }] };
        });
        set({ isOpen: true });
      },

      removeItem: (productId, variantSku) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.variant.sku === variantSku)
          ),
        })),

      updateQty: (productId, variantSku, qty) => {
        if (qty < 1) {
          get().removeItem(productId, variantSku);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.variant.sku === variantSku
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], promoCode: "", promoDiscount: 0 }),

      applyPromo: (code) => {
        const discount = PROMO_CODES[code.toUpperCase()];
        if (discount) {
          set({ promoCode: code.toUpperCase(), promoDiscount: discount });
          return true;
        }
        return false;
      },

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (acc, i) => acc + i.variant.price * i.quantity,
          0
        ),
    }),
    { name: "ak-cart" }
  )
);
