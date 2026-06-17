"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, PackageX } from "lucide-react";
import type { Product } from "@/data/products";
import { filterAndSort } from "@/lib/commerce";
import ProductCard from "@/components/product/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

interface FilterPanelProps {
  priceMax: number;
  setPriceMax: (v: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
}

const FilterPanel = ({ priceMax, setPriceMax, inStockOnly, setInStockOnly }: FilterPanelProps) => (
  <div className="space-y-8">
    <div>
      <h3
        className="text-[.72rem] tracking-[.14em] uppercase mb-3"
        style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
      >
        Max Price: <span style={{ color: "var(--accent)" }}>Rs {priceMax.toLocaleString("en-PK")}</span>
      </h3>
      <input
        type="range" min={0} max={100000} step={1000} value={priceMax}
        onChange={(e) => setPriceMax(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--accent)" }}
      />
      <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)" }}>
        <span>Rs 0</span><span>Rs 1,00,000</span>
      </div>
    </div>

    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative w-4 h-4 flex-shrink-0">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="sr-only"
        />
        <div
          className="w-4 h-4 rounded-[4px] grid place-items-center transition-all"
          style={{
            border: inStockOnly ? "1px solid var(--accent)" : "1px solid var(--line-2)",
            background: inStockOnly ? "var(--accent)" : "transparent",
          }}
        >
          {inStockOnly && (
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5L8.5 2" stroke="var(--on-accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>In Stock Only</span>
    </label>

    {(inStockOnly || priceMax < 100000) && (
      <button
        onClick={() => { setInStockOnly(false); setPriceMax(100000); }}
        className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
        style={{ color: "var(--accent)" }}
      >
        <X className="w-3.5 h-3.5" /> Clear Filters
      </button>
    )}
  </div>
);

export default function ShopClient({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams();
  const [priceMax, setPriceMax] = useState(100000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(searchParams.get("sort") ?? "featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(
    () => filterAndSort([...allProducts], { priceMax, inStockOnly, sort }),
    [allProducts, priceMax, inStockOnly, sort]
  );

  const activeFilterCount = (inStockOnly ? 1 : 0) + (priceMax < 100000 ? 1 : 0);
  const clearFilters = () => { setInStockOnly(false); setPriceMax(100000); };

  const paginated = filtered.slice(0, page * PER_PAGE);

  const selectStyle = {
    background: "var(--surface)",
    border: "1px solid var(--line-2)",
    color: "var(--text)",
    fontFamily: "var(--font-space-mono)",
    fontSize: ".78rem",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
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
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-28">
              <FilterPanel
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-[11px] text-sm font-semibold transition-all cursor-pointer"
                style={{ border: "1px solid var(--line-2)", color: "var(--text)", background: "var(--surface)" }}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && (
                  <span
                    className="grid place-items-center w-5 h-5 rounded-full text-[.65rem] font-bold leading-none"
                    style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-space-mono)" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
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
              <div className="flex flex-col items-center justify-center text-center py-24">
                <div className="w-16 h-16 rounded-full grid place-items-center mb-5" style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}>
                  <PackageX className="w-7 h-7" style={{ color: "var(--muted)" }} />
                </div>
                <p className="text-lg font-medium mb-2" style={{ color: "var(--text)" }}>No products match your filters.</p>
                <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Try widening your price range or turning off &ldquo;In Stock Only.&rdquo;</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-[13px] font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
                    style={{ background: "var(--accent)", color: "var(--on-accent)" }}
                  >
                    <X className="w-4 h-4" /> Clear all filters
                  </button>
                )}
              </div>
            )}

            {paginated.length < filtered.length && (
              <div className="text-center mt-10">
                <button
                  type="button"
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

      {filtersOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "var(--scrim)" }} onClick={() => setFiltersOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[20px] p-6 max-h-[80vh] overflow-y-auto"
            style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-anton)", fontSize: "1.4rem" }}>FILTERS</h3>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" style={{ color: "var(--muted)" }}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="w-full mt-6 py-3.5 rounded-[13px] font-semibold cursor-pointer"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
