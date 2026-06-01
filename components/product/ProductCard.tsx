"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.variants[0]);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <article
        className="product-card rounded-[var(--r)] overflow-hidden flex flex-col h-full transition-all duration-300"
      >
        {/* Thumbnail */}
        <div
          className="relative w-full overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "4/3", background: "radial-gradient(70% 70% at 50% 40%,#1a1e26,#0a0c10)" }}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
          />

          {product.badge && (
            <span
              className="absolute top-3.5 left-3.5 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.12em] uppercase"
              style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
            >
              {product.badge}
            </span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,9,11,.7)" }}>
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
              {formatPrice(product.price)}
            </span>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="btn-add-to-cart w-[42px] h-[42px] rounded-[11px] grid place-items-center transition-all duration-200 cursor-pointer disabled:opacity-40"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
