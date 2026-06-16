"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, ShoppingCart } from "lucide-react";
import type { Product, Variant } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";

/**
 * <BlogProductEmbed /> — an inline product conversion callout for article bodies.
 *
 * Product data (image, title, price, rating) is resolved server-side at build and passed
 * in, so the card is fully present in the prerendered HTML: zero client fetch waterfall,
 * zero CLS (fixed image box), and the offer is visible to crawlers. The only client work
 * is the Add-to-Cart interaction.
 *
 * Authors place it in markdown content with a standalone line: [[product:SKU]]
 */
export default function BlogProductEmbed({
  product,
  variant,
}: {
  product: Product;
  variant: Variant;
}) {
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product, variant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const img = (!imgErr && product.images[0]) || "/placeholder.svg";
  const priced = product.inStock && variant.price > 0;

  return (
    <aside
      className="not-prose my-8 flex flex-col sm:flex-row items-stretch gap-4 rounded-[16px] p-4 sm:p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
      aria-label={`Featured product: ${product.name}`}
    >
      {/* Fixed-size image box — no layout shift */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-full sm:w-[120px] h-[160px] sm:h-[120px] flex-shrink-0 rounded-[12px] overflow-hidden"
        style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
      >
        <Image
          src={img}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, 120px"
          className="object-cover"
          onError={() => setImgErr(true)}
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        <span
          className="text-[.62rem] font-bold uppercase tracking-[.14em]"
          style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}
        >
          Recommended product
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="text-[1.05rem] font-semibold leading-snug line-clamp-2 transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text)" }}
        >
          {product.name}
        </Link>
        {product.reviews > 0 && <StarRating rating={product.rating} reviews={product.reviews} />}

        <div className="flex items-center justify-between gap-3 mt-1.5 flex-wrap">
          <span className="text-[1.3rem]" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: "var(--text)" }}>
            {priced ? (
              product.variants.length > 1 ? `from ${formatPrice(product.price)}` : formatPrice(variant.price)
            ) : (
              <span className="text-[1rem]" style={{ color: "var(--muted)" }}>Coming soon</span>
            )}
          </span>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[11px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            style={{ background: added ? "var(--surface-2)" : "var(--accent)", color: added ? "var(--accent)" : "#000" }}
          >
            {added ? (
              <><Check className="w-4 h-4" /> Added</>
            ) : (
              <>{product.inStock ? <ShoppingCart className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
