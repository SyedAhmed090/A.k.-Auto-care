"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchProducts } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState(() => searchProducts(initialQ));

  useEffect(() => {
    setResults(searchProducts(query));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Search bar */}
      <div className="bg-[#0a0a0a] pt-10 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-3">Search</p>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-white/10 text-white placeholder-gray-500 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#e8320a]"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
          {query && (
            <p className="text-gray-400 text-sm mt-3">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {!query && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Start typing to search products</p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl font-black text-[#0f0f0f] mb-2">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-gray-400 mb-6">Try different keywords or browse our categories.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:border-[#e8320a] hover:text-[#e8320a] transition-colors">All Products</Link>
              <Link href="/categories/ceramic-coatings" className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:border-[#e8320a] hover:text-[#e8320a] transition-colors">Ceramic Coatings</Link>
              <Link href="/categories/polishes-compounds" className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:border-[#e8320a] hover:text-[#e8320a] transition-colors">Polishes</Link>
              <Link href="/categories/kits-bundles" className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:border-[#e8320a] hover:text-[#e8320a] transition-colors">Kits & Bundles</Link>
            </div>
          </div>
        )}

        {query && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
