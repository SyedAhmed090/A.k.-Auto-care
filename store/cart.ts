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
  applyPromo: (code: string) => Promise<{ valid: boolean; discount: number; reason?: string }>;
  removePromo: () => void;
  itemCount: () => number;
  subtotal: () => number;
}


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
            (i) => i.product.id === product.id && i.variant.sku === variant.sku
          );
          const maxQty = product.stock ?? 99;
          if (existing) {
            const newQty = Math.min(existing.quantity + qty, maxQty);
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.variant.sku === variant.sku
                  ? { ...i, quantity: newQty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, variant, quantity: Math.min(qty, maxQty) }] };
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
        if (qty < 1) { get().removeItem(productId, variantSku); return; }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.product.id === productId && i.variant.sku === variantSku) {
              const maxQty = i.product.stock ?? 99;
              return { ...i, quantity: Math.min(qty, maxQty) };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [], promoCode: "", promoDiscount: 0 }),

      applyPromo: async (code) => {
        const subtotal = get().subtotal();
        try {
          const res = await fetch("/api/promo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal }),
          });
          const data = await res.json();
          if (data.valid) {
            set({ promoCode: code.toUpperCase(), promoDiscount: data.discount });
          }
          return data;
        } catch {
          return { valid: false, reason: "Unable to validate code." };
        }
      },

      removePromo: () => set({ promoCode: "", promoDiscount: 0 }),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (acc, i) => acc + i.variant.price * i.quantity,
          0
        ),
    }),
    {
      name: "ak-cart",
      // D-12: Version the persisted shape so stale localStorage data is safely
      // migrated when CartItem or Product types change, preventing hydration
      // errors for returning users after a deploy.
      version: 1,
      migrate: (persistedState, version) => {
        // v0 → v1: initial versioning — existing carts are structurally valid,
        // just pass them through. Bump version and add a case here whenever
        // CartItem, Product, or Variant shapes gain required fields.
        void version;
        return persistedState as CartStore;
      },
    }
  )
);
