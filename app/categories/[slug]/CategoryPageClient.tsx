"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PackageX, X } from "lucide-react";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { filterAndSort } from "@/lib/commerce";
import ProductCard from "@/components/product/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default function CategoryPageClient({ category, products }: { category: Category; products: Product[] }) {
  const [priceMax, setPriceMax] = useState(100000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(
    () => filterAndSort([...products], { priceMax, inStockOnly, sort }),
    [products, priceMax, inStockOnly, sort]
  );

  const activeFilterCount = (inStockOnly ? 1 : 0) + (priceMax < 100000 ? 1 : 0);
  const clearFilters = () => { setInStockOnly(false); setPriceMax(100000); };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <Image src={category.image} alt={category.name} fill className="object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--bg) 40%, transparent 80%)" }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: .3,
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex items-center gap-2.5 mb-3 text-[.72rem] tracking-[.14em] uppercase"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
              Category
            </div>
            <h1
              className="uppercase leading-[.96] tracking-[.01em]"
              style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem,6vw,5rem)" }}
            >
              {category.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm" style={{ color: "var(--muted)" }}>{category.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--text)] transition-colors">Shop</Link>
          <span>/</span>
          <span style={{ color: "var(--text)" }} className="truncate max-w-[200px]">{category.name}</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-y-3 gap-x-4">
          <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            {filtered.length} products
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--muted)" }}>
              <div
                className="w-4 h-4 rounded-[4px] grid place-items-center flex-shrink-0 cursor-pointer"
                style={{
                  border: inStockOnly ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                  background: inStockOnly ? "var(--accent)" : "transparent",
                }}
                onClick={() => setInStockOnly(!inStockOnly)}
              >
                {inStockOnly && (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5L8.5 2" stroke="var(--on-accent)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span onClick={() => setInStockOnly(!inStockOnly)}>In Stock</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>Max: Rs {priceMax.toLocaleString("en-PK")}</span>
              <input
                type="range" min={0} max={100000} step={1000} value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-28"
                style={{ accentColor: "var(--accent)" }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-[11px] px-3 py-2.5 outline-none cursor-pointer text-[.78rem]"
              style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-space-mono)" }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-16 h-16 rounded-full grid place-items-center mb-5" style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}>
              <PackageX className="w-7 h-7" style={{ color: "var(--muted)" }} />
            </div>
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text)" }}>No products match your filters.</p>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              {activeFilterCount > 0
                ? "Try widening your price range or turning off “In Stock.”"
                : "Check back soon — new products are added regularly."}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-[13px] font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "var(--on-accent)" }}
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            ) : (
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "var(--on-accent)" }}
              >
                Browse all products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
