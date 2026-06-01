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

  useEffect(() => { setResults(searchProducts(query)); }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-14 pb-16" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
            <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
            Search
          </div>
          <form onSubmit={handleSubmit}>
            <div className="relative max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--muted)" }} />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-14 pr-14 py-4 text-lg rounded-[14px] outline-none transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--line-2)")}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--muted)" }}>
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
          {query && (
            <p className="mt-3 text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-8 py-12">
        {!query && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p style={{ color: "var(--muted)" }}>Start typing to search products</p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[2rem] uppercase mb-2" style={{ fontFamily: "var(--font-anton)" }}>No results</p>
            <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>Try different keywords or browse our categories.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["All Products:/shop", "Ceramic Coatings:/categories/ceramic-coatings", "Polishes:/categories/polishes-compounds", "Kits:/categories/kits-bundles"].map((item) => {
                const [label, href] = item.split(":");
                return (
                  <Link
                    key={label}
                    href={href}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:text-[var(--accent)]"
                    style={{ border: "1px solid var(--line-2)", color: "var(--muted)" }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {query && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}
