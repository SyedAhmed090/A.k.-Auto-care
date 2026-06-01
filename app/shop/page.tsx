"use client";
import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import products from "@/data/products";
import categories from "@/data/categories";
import ProductCard from "@/components/product/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default function ShopPage() {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(200);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const toggleCat = (slug: string) =>
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.categorySlug));
    list = list.filter((p) => p.price <= priceMax);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [selectedCats, priceMax, inStockOnly, sort]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-[#0f0f0f] uppercase tracking-widest mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCats.includes(cat.slug)}
                onChange={() => toggleCat(cat.slug)}
                className="w-4 h-4 accent-[#e8320a] rounded"
              />
              <span className="text-sm text-gray-600 group-hover:text-[#0f0f0f] transition-colors">{cat.name}</span>
              <span className="ml-auto text-xs text-gray-400">
                ({products.filter((p) => p.categorySlug === cat.slug).length})
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-sm text-[#0f0f0f] uppercase tracking-widest mb-3">
          Max Price: <span className="text-[#e8320a]">£{priceMax}</span>
        </h3>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#e8320a]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>£10</span><span>£200</span>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-[#e8320a] rounded"
          />
          <span className="text-sm font-semibold text-[#0f0f0f]">In Stock Only</span>
        </label>
      </div>
      {(selectedCats.length > 0 || inStockOnly || priceMax < 200) && (
        <button
          onClick={() => { setSelectedCats([]); setInStockOnly(false); setPriceMax(200); }}
          className="flex items-center gap-1.5 text-sm text-[#e8320a] hover:text-[#c42a08] font-semibold transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-[#0a0a0a] pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2">All Products</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white">The Shop</h1>
          <p className="text-gray-400 mt-2">{filtered.length} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:border-[#e8320a] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {(selectedCats.length > 0 || inStockOnly) && (
                  <span className="bg-[#e8320a] text-white text-xs px-1.5 py-0.5 rounded-full">
                    {selectedCats.length + (inStockOnly ? 1 : 0)}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-400 hidden sm:inline">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#e8320a] cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {selectedCats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCats.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return (
                    <button
                      key={slug}
                      onClick={() => toggleCat(slug)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#e8320a]/10 text-[#e8320a] text-xs font-semibold rounded-full hover:bg-[#e8320a]/20 transition-colors"
                    >
                      {cat?.name} <X className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <p className="text-gray-400 text-lg font-medium">No products match your filters.</p>
                <button onClick={() => { setSelectedCats([]); setInStockOnly(false); setPriceMax(200); }} className="mt-4 text-sm text-[#e8320a] font-semibold hover:underline">
                  Clear all filters
                </button>
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 border-2 border-[#e8320a] text-[#e8320a] font-bold rounded-lg hover:bg-[#e8320a] hover:text-white transition-colors"
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
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setFiltersOpen(false)} className="w-full mt-6 py-3 bg-[#e8320a] text-white font-bold rounded-lg">
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
