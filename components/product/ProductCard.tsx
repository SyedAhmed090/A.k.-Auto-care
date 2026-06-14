"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import WishlistButton from "@/components/ui/WishlistButton";

const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.variants[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isLowStock = product.inStock && product.stock != null && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <article
        className="product-card rounded-[var(--r)] overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/30 group-hover:border-[var(--accent)]"
      >
        {/* Thumbnail */}
        <div
          className="relative w-full overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "4/3", background: "radial-gradient(70% 70% at 50% 40%,#16191f,#0a0b0d)" }}
        >
          <Image
            src={imgError ? "/placeholder.svg" : product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />

          {product.badge && (
            <span
              className="absolute top-3.5 left-3.5 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.12em] uppercase z-10"
              style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
            >
              {product.badge}
            </span>
          )}

          <WishlistButton product={product} />

          {isLowStock && (
            <span
              className="absolute bottom-3.5 left-3.5 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.12em] uppercase z-10"
              style={{ background: "#fb923c", color: "#000", fontFamily: "var(--font-space-mono)" }}
            >
              Only {product.stock} left
            </span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(10, 11, 13,.7)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col gap-1.5 flex-1">
          <span className="font-semibold text-[1.05rem] leading-tight line-clamp-2" style={{ color: "var(--text)" }}>
            {product.name}
          </span>

          <StarRating rating={product.rating} reviews={product.reviews} />

          <div
            className="flex items-center justify-between mt-auto pt-4"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <span
              className="text-[1.35rem]"
              style={{
                fontFamily: "var(--font-hanken)",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {product.variants.length > 1 ? `from ${formatPrice(product.price)}` : formatPrice(product.price)}
            </span>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="btn-add-to-cart w-[42px] h-[42px] rounded-[11px] grid place-items-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-2)]"
              aria-label={`Add ${product.name} to cart`}
              style={added ? { background: "var(--accent)", color: "#000", border: "1px solid var(--accent)" } : undefined}
            >
              {added ? <Check className="w-[18px] h-[18px]" /> : <Plus className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
