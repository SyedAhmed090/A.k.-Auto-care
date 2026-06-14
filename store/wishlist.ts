"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

/** Minimal product snapshot stored for the wishlist (enough to render a card). */
export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  count: () => number;
}

function toItem(p: Product): WishlistItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? "/placeholder.svg",
    price: p.price,
    rating: p.rating,
    reviews: p.reviews,
  };
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) =>
          state.items.some((i) => i.id === product.id)
            ? { items: state.items.filter((i) => i.id !== product.id) }
            : { items: [...state.items, toItem(product)] }
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: "ak-wishlist" }
  )
);
