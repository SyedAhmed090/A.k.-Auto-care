"use client";
import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import products from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default function ShopPage() {
  const [priceMax, setPriceMax] = useState(200);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let list = [...products];
    list = list.filter((p) => p.price <= priceMax);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [priceMax, inStockOnly, sort]);

  const paginated = filtered.slice(0, page * PER_PAGE);

  const selectStyle = {
    background: "var(--surface)",
    border: "1px solid var(--line-2)",
    color: "var(--text)",
    fontFamily: "var(--font-space-mono)",
    fontSize: ".78rem",
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3
          className="text-[.72rem] tracking-[.14em] uppercase mb-3"
          style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
        >
          Max Price: <span style={{ color: "var(--accent)" }}>£{priceMax}</span>
        </h3>
        <input
          type="range" min={10} max={200} step={5} value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
          <span>£10</span><span>£200</span>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className="w-4 h-4 rounded-[4px] grid place-items-center flex-shrink-0 transition-all"
          style={{
            border: inStockOnly ? "1px solid var(--accent)" : "1px solid var(--line-2)",
            background: inStockOnly ? "var(--accent)" : "transparent",
          }}
          onClick={() => setInStockOnly(!inStockOnly)}
        >
          {inStockOnly && (
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5L8.5 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium" onClick={() => setInStockOnly(!inStockOnly)}>In Stock Only</span>
      </label>

      {(inStockOnly || priceMax < 200) && (
        <button
          onClick={() => { setInStockOnly(false); setPriceMax(200); }}
          className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
          style={{ color: "var(--accent)" }}
        >
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="pt-14 pb-16" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-2.5 mb-3 text-[.72rem] tracking-[.14em] uppercase"
            style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
          >
            <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
            All Products
          </div>
          <h1
            className="uppercase leading-[.96] tracking-[.01em]"
            style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem,6vw,5rem)" }}
          >
            The Shop
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            {filtered.length} products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-28">
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-[11px] text-sm font-semibold transition-all cursor-pointer"
                style={{ border: "1px solid var(--line-2)", color: "var(--text)", background: "var(--surface)" }}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-[11px] px-3 py-2.5 text-[.78rem] outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>No products match your filters.</p>
              </div>
            )}

            {paginated.length < filtered.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3.5 rounded-[13px] font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
                  style={{ border: "1px solid var(--line-2)", color: "var(--text)", background: "var(--surface)" }}
                >
                  Load More ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "rgba(8,9,11,.8)" }} onClick={() => setFiltersOpen(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-[20px] p-6 max-h-[80vh] overflow-y-auto"
            style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-anton)", fontSize: "1.4rem" }}>FILTERS</h3>
              <button onClick={() => setFiltersOpen(false)} style={{ color: "var(--muted)" }}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full mt-6 py-3.5 rounded-[13px] font-semibold cursor-pointer"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
