"use client";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Zap, CheckCircle } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/product/ProductCard";

const TABS = ["Description", "How to Use", "Specs"] as const;
type Tab = typeof TABS[number];

export default function ProductPage() {
  const params = useParams();
  const product = getProductBySlug(params.slug as string);
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

  const divider = { borderColor: "var(--line)" };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-[1280px] mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-xs mb-10"
          style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
        >
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--text)] transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/categories/${product.categorySlug}`} className="hover:text-[var(--text)] transition-colors capitalize">
            {product.categorySlug.replace(/-/g, " ")}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text)" }} className="truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Gallery */}
          <div className="space-y-3">
            <div
              className="relative aspect-square rounded-[20px] overflow-hidden"
              style={{ background: "radial-gradient(70% 70% at 50% 40%,#1a1e26,#0a0c10)", border: "1px solid var(--line)" }}
            >
              <Image src={product.images[activeImg]} alt={product.name} fill className="object-cover opacity-70" priority />
              {product.badge && (
                <span
                  className="absolute top-4 left-4 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.12em] uppercase"
                  style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
                >
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="relative w-20 h-20 rounded-[10px] overflow-hidden cursor-pointer transition-all"
                    style={{
                      border: activeImg === i ? "2px solid var(--accent)" : "1px solid var(--line-2)",
                      background: "var(--surface)",
                    }}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span
              className="text-[.72rem] tracking-[.14em] uppercase mb-2 block"
              style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
            >
              {product.categorySlug.replace(/-/g, " ")}
            </span>
            <h1
              className="uppercase leading-[.98] tracking-[.01em] mb-3"
              style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3rem)" }}
            >
              {product.name}
            </h1>
            <p className="mb-4 text-[.95rem]" style={{ color: "var(--muted)" }}>{product.tagline}</p>
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} reviews={product.reviews} size="md" />
            </div>

            {/* Price */}
            <div
              className="text-[2.4rem] mb-5"
              style={{
                fontFamily: "var(--font-anton)",
                background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
              }}
            >
              {formatPrice(variant.price)}
            </div>

            {/* Stock */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: product.inStock ? "rgba(216,255,53,.1)" : "rgba(239,68,68,.1)",
                color: product.inStock ? "var(--accent)" : "#ef4444",
                border: `1px solid ${product.inStock ? "rgba(216,255,53,.2)" : "rgba(239,68,68,.2)"}`,
                fontFamily: "var(--font-space-mono)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: product.inStock ? "var(--accent)" : "#ef4444" }}
              />
              {product.inStock ? "In Stock — Ready to Ship" : "Out of Stock"}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <p
                  className="text-[.72rem] tracking-[.14em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
                >
                  Size / Option
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(i)}
                      className="px-4 py-2.5 rounded-[11px] text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        border: selectedVariant === i ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                        background: selectedVariant === i ? "rgba(216,255,53,.08)" : "var(--surface)",
                        color: selectedVariant === i ? "var(--accent)" : "var(--muted)",
                      }}
                    >
                      {v.label}
                      <span className="ml-2 text-xs opacity-70">{formatPrice(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-7">
              <p
                className="text-[.72rem] tracking-[.14em] uppercase"
                style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
              >
                Qty
              </p>
              <div className="flex items-center rounded-[11px] overflow-hidden" style={{ border: "1px solid var(--line-2)" }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 grid place-items-center hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  className="w-10 text-center text-sm font-bold"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 grid place-items-center hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-8 flex-wrap">
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="flex-1 py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-40 hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "#0a0b0d" }}
                onMouseEnter={(e) => { if (product.inStock) (e.currentTarget as HTMLElement).style.background = "var(--accent-press)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
              >
                {added ? <><CheckCircle className="w-4.5 h-4.5" /> Added!</> : "Add to Cart"}
              </button>
              <button
                onClick={() => { addItem(product, variant, qty); window.location.href = "/checkout"; }}
                disabled={!product.inStock}
                className="flex-1 py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-40 hover:-translate-y-0.5 hover:bg-white/7"
                style={{ border: "1px solid var(--line-2)", color: "var(--text)", background: "rgba(255,255,255,.02)" }}
              >
                <Zap className="w-4.5 h-4.5" /> Buy Now
              </button>
            </div>

            {/* Trust */}
            <div className="rounded-[14px] p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              {["Free shipping on orders over £75", "30-day hassle-free returns", "Secure payment via Stripe"].map((t) => (
                <p key={t} className="flex items-center gap-2.5 text-xs" style={{ color: "var(--muted)" }}>
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                  {t}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="flex gap-0" style={{ borderBottom: "1px solid var(--line)" }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-6 py-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px"
                style={{
                  borderBottomColor: tab === t ? "var(--accent)" : "transparent",
                  color: tab === t ? "var(--accent)" : "var(--muted)",
                  fontFamily: "var(--font-space-mono)",
                  fontSize: ".78rem",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="py-8 max-w-3xl">
            {tab === "Description" && <p className="leading-relaxed text-[.97rem]" style={{ color: "var(--muted)" }}>{product.description}</p>}
            {tab === "How to Use" && <p className="leading-relaxed text-[.97rem]" style={{ color: "var(--muted)" }}>{product.howToUse}</p>}
            {tab === "Specs" && (
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((s) => (
                    <tr key={s.label} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td className="py-3.5 pr-8 font-semibold w-1/2">{s.label}</td>
                      <td className="py-3.5" style={{ color: "var(--muted)" }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16" style={{ borderTop: "1px solid var(--line)", paddingTop: "60px" }}>
            <h2
              className="uppercase tracking-[.01em] mb-8"
              style={{ fontFamily: "var(--font-anton)", fontSize: "2rem" }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
