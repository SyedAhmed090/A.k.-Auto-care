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
    <Link href={`/products/${product.slug}`} className="group block">
      <article
        className="rounded-[var(--r)] overflow-hidden flex flex-col transition-all duration-350"
        style={{
          border: "1px solid var(--line)",
          background: "var(--bg-2)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--line-2)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
      >
        {/* Thumbnail */}
        <div
          className="relative h-[230px] overflow-hidden"
          style={{ background: "radial-gradient(70% 70% at 50% 40%,#1a1e26,#0a0c10)" }}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover opacity-60 group-hover:opacity-75 transition-all duration-500 group-hover:scale-105"
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
          <span
            className="text-[.62rem] tracking-[.16em] uppercase"
            style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
          >
            {product.categorySlug.replace(/-/g, " ")}
          </span>

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
                fontFamily: "var(--font-anton)",
                background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {formatPrice(product.price)}
            </span>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="w-[42px] h-[42px] rounded-[11px] grid place-items-center transition-all duration-250 cursor-pointer disabled:opacity-40"
              style={{ border: "1px solid var(--line-2)", background: "transparent", color: "var(--text)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#000";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.borderColor = "var(--line-2)";
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
