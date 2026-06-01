"use client";
import { useState, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { SlidersHorizontal, X } from "lucide-react";
import { getCategoryBySlug, default as categories } from "@/data/categories";
import { getProductsByCategory, default as allProducts } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = getCategoryBySlug(slug);

  const [priceMax, setPriceMax] = useState(200);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  if (!category) notFound();

  const base = getProductsByCategory(slug);

  const filtered = useMemo(() => {
    let list = [...base];
    list = list.filter((p) => p.price <= priceMax);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [base, priceMax, inStockOnly, sort]);

  return (
    <div className="bg-white min-h-screen">
      {/* Category hero */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <Image src={category.image} alt={category.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: category.accent }}>
              Category
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white">{category.name}</h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <p className="text-sm text-gray-500">{filtered.length} products</p>
          <div className="flex items-center gap-4 ml-auto flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-[#e8320a]" />
              In Stock Only
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Max: £{priceMax}</span>
              <input type="range" min={10} max={200} step={5} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-28 accent-[#e8320a]" />
            </div>
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

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">No products match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
