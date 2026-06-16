"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Sparkles } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { getSystemForProduct } from "@/data/bundles";
import { formatPrice } from "@/lib/utils";

const LIMIT = 3;

/**
 * Recommend in-stock products to add to the cart: first the missing steps of any detailing
 * system already represented in the cart ("complete your system"), then other in-stock
 * products as a fallback. Anything already in the cart is excluded.
 */
function recommend(all: Product[], cartSlugs: Set<string>): Product[] {
  const picks: Product[] = [];
  const seen = new Set(cartSlugs);
  const take = (p: Product | undefined) => {
    if (!p || seen.has(p.slug) || !p.inStock) return;
    picks.push(p);
    seen.add(p.slug);
  };

  // 1. Missing system steps for what's already in the cart
  for (const slug of cartSlugs) {
    const sys = getSystemForProduct(slug);
    if (!sys) continue;
    for (const step of sys.steps) {
      if (picks.length >= LIMIT) break;
      take(all.find((p) => p.slug === step.slug));
    }
    if (picks.length >= LIMIT) break;
  }

  // 2. Fallback: other in-stock products (featured first)
  if (picks.length < LIMIT) {
    for (const p of [...all].sort((a, b) => Number(b.featured) - Number(a.featured))) {
      if (picks.length >= LIMIT) break;
      take(p);
    }
  }

  return picks.slice(0, LIMIT);
}

export default function CartUpsell({ allProducts }: { allProducts: Product[] }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [imgErr, setImgErr] = useState<Record<string, boolean>>({});

  const cartSlugs = useMemo(
    () => new Set(items.map((i) => i.product.slug)),
    [items]
  );
  const recs = useMemo(
    () => recommend(allProducts, cartSlugs),
    [allProducts, cartSlugs]
  );

  // Whether any cart item is part of a curated system — drives the heading copy.
  const completesSystem = useMemo(
    () => [...cartSlugs].some((s) => getSystemForProduct(s)),
    [cartSlugs]
  );

  if (recs.length === 0) return null;

  const handleAdd = (p: Product) => {
    const v = p.variants[0];
    if (!v) return;
    addItem(p, v, 1);
    setAdded((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [p.id]: false })), 2000);
  };

  return (
    <section
      className="mt-8 rounded-[var(--r)] p-5 sm:p-6"
      style={{ border: "1px solid var(--line)", background: "var(--bg-2)" }}
      aria-labelledby="cart-upsell-heading"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
        <h2
          id="cart-upsell-heading"
          className="text-[.78rem] tracking-[.14em] uppercase"
          style={{ fontFamily: "var(--font-space-mono)", color: "var(--text)" }}
        >
          {completesSystem ? "Complete your system" : "You might also need"}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recs.map((p) => {
          const v = p.variants[0];
          const priced = (v?.price ?? 0) > 0;
          const img = (!imgErr[p.id] && p.images[0]) || "/placeholder.svg";
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-[12px] p-3"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <Link
                href={`/products/${p.slug}`}
                className="relative w-14 h-14 rounded-[9px] overflow-hidden flex-shrink-0"
                style={{ background: "var(--bg)" }}
              >
                <Image
                  src={img}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  onError={() => setImgErr((prev) => ({ ...prev, [p.id]: true }))}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${p.slug}`}
                  className="block text-[.84rem] font-semibold leading-tight line-clamp-2 transition-colors hover:text-[var(--accent)]"
                >
                  {p.name}
                </Link>
                <p className="text-[.78rem] mt-0.5" style={{ color: "var(--accent)", fontFamily: "var(--font-hanken)", fontWeight: 700 }}>
                  {priced ? formatPrice(v!.price) : "—"}
                </p>
              </div>
              <button
                onClick={() => handleAdd(p)}
                aria-label={`Add ${p.name} to cart`}
                className="flex-shrink-0 w-9 h-9 rounded-[9px] grid place-items-center cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ background: added[p.id] ? "var(--surface-2)" : "var(--accent)", color: added[p.id] ? "var(--accent)" : "#000" }}
              >
                {added[p.id] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
