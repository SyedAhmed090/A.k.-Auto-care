"use client";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Zap, CheckCircle, ChevronLeft } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";

const TABS = ["Description", "How to Use", "Specs"] as const;
type Tab = (typeof TABS)[number];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("Description");
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  if (!product) notFound();

  const related = getRelatedProducts(product);
  const variant = product.variants[selectedVariant];

  const handleAdd = () => {
    addItem(product, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, variant, qty);
    window.location.href = "/checkout";
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#0f0f0f] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0f0f0f] transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/categories/${product.categorySlug}`} className="hover:text-[#0f0f0f] transition-colors capitalize">
            {product.categorySlug.replace(/-/g, " ")}
          </Link>
          <span>/</span>
          <span className="text-[#0f0f0f] truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
              <Image
                src={product.images[activeImg]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge variant={product.badge === "Premium" ? "dark" : "accent"}>{product.badge}</Badge>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImg === i ? "border-[#e8320a]" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2">
              {product.categorySlug.replace(/-/g, " ")}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0f0f0f] leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-gray-500 mb-4">{product.tagline}</p>

            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} reviews={product.reviews} size="md" />
              <span className="text-sm text-gray-400">{product.rating}/5</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-[#0f0f0f]">
                {formatPrice(variant.price)}
              </span>
              {product.variants.length > 1 && variant.price !== product.price && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Stock */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 ${
              product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
              {product.inStock ? "In Stock — Ready to Ship" : "Out of Stock"}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-[#0f0f0f] mb-2">Size / Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(i)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        selectedVariant === i
                          ? "border-[#e8320a] bg-[#e8320a]/5 text-[#e8320a]"
                          : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {v.label}
                      <span className="ml-2 text-xs opacity-70">{formatPrice(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <div>
                <p className="text-sm font-bold text-[#0f0f0f] mb-2">Quantity</p>
                <QuantityStepper value={qty} onChange={setQty} />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAdd}
                disabled={!product.inStock}
              >
                {added ? (
                  <><CheckCircle className="w-5 h-5" /> Added!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 bg-[#0f0f0f] text-white hover:bg-gray-800"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                <Zap className="w-5 h-5" /> Buy Now
              </Button>
            </div>

            {/* Trust points */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2">
              {[
                "Free shipping on orders over £75",
                "30-day hassle-free returns",
                "Secure payment via Stripe",
              ].map((t) => (
                <p key={t} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  {t}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <div className="flex gap-1 border-b border-gray-100 mb-8">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-[#e8320a] text-[#e8320a]"
                    : "border-transparent text-gray-400 hover:text-[#0f0f0f]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Description" && (
            <div className="prose prose-sm max-w-3xl text-gray-700 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}
          {tab === "How to Use" && (
            <div className="prose prose-sm max-w-3xl text-gray-700 leading-relaxed">
              <p>{product.howToUse}</p>
            </div>
          )}
          {tab === "Specs" && (
            <div className="max-w-lg">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {product.specs.map((spec) => (
                    <tr key={spec.label}>
                      <td className="py-3 pr-6 font-semibold text-[#0f0f0f] w-1/2">{spec.label}</td>
                      <td className="py-3 text-gray-600">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-[#0f0f0f] mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
