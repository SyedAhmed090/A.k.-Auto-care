"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Zap, CheckCircle, Truck, RotateCcw, Shield, MessageCircle, Share2, ZoomIn, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/product/ProductCard";
import QuantityStepper from "@/components/ui/QuantityStepper";
import WishlistButton from "@/components/ui/WishlistButton";
import SampleRequestButton from "@/components/product/SampleRequestButton";
import ReviewsSection from "@/components/product/ReviewsSection";
import { trackViewContent, trackAddToCart } from "@/components/analytics/MetaPixel";
import { useSettings } from "@/components/providers/SettingsProvider";

const TABS = ["Description", "How to Use", "Specs"] as const;
type Tab = typeof TABS[number];

const LOW_STOCK_THRESHOLD = 5;

const TRUST = [
  { icon: Truck,       label: "Free delivery", sub: "Orders over Rs 5,000" },
  { icon: RotateCcw,   label: "30-day returns", sub: "No questions asked" },
  { icon: Shield,      label: "100% Genuine",   sub: "Lab-tested formulas" },
  { icon: MessageCircle, label: "WhatsApp support", sub: "Reply in minutes" },
];

export default function ProductPageClient({ product, related }: { product: Product; related: Product[] }) {
  const { store } = useSettings();
  const [activeImg, setActiveImg]           = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [qty, setQty]                       = useState(1);
  const [tab, setTab]                       = useState<Tab>("Description");
  const [added, setAdded]                   = useState(false);
  const [stickyVisible, setStickyVisible]   = useState(false);
  const [mainImgError, setMainImgError]     = useState(false);
  const [thumbErrors, setThumbErrors]       = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen]     = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const imgCount = product.images.length;
  const showPrev = () => setActiveImg((i) => (i - 1 + imgCount) % imgCount);
  const showNext = () => setActiveImg((i) => (i + 1) % imgCount);

  const addItem  = useCartStore((s) => s.addItem);
  const router   = useRouter();
  const variant  = product.variants[selectedVariant];
  const maxQty   = product.stock ?? 99;
  const isLowStock = product.inStock && product.stock != null && product.stock <= LOW_STOCK_THRESHOLD;

  useEffect(() => {
    trackViewContent({ id: product.id, name: product.name, price: variant.price, categorySlug: product.categorySlug });
  }, [product.id, product.name, product.categorySlug, variant.price]);

  useEffect(() => {
    if (!ctaRef.current) return;
    const io = new IntersectionObserver(([e]) => setStickyVisible(!e.isIntersecting), { threshold: 0 });
    io.observe(ctaRef.current);
    return () => io.disconnect();
  }, []);

  // Keyboard controls for the lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, imgCount]);

  const handleAdd = () => {
    addItem(product, variant, qty);
    trackAddToCart(product, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, variant, qty);
    trackAddToCart(product, variant, qty);
    useCartStore.getState().closeCart();
    router.push("/checkout");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const waMsg = encodeURIComponent(`Hi! I have a question about ${product.name}: `);
  const waUrl = `https://wa.me/${store.whatsapp}?text=${waMsg}`;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-10" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Gallery */}
          <div className="space-y-3 lg:sticky lg:top-28">
            <div
              className="relative aspect-square rounded-[20px] overflow-hidden group"
              style={{ background: "radial-gradient(70% 70% at 50% 40%,#16191f,#0a0b0d)", border: "1px solid var(--line)" }}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Zoom image"
                className="absolute inset-0 z-[1] cursor-zoom-in"
              />
              <Image
                src={mainImgError ? "/placeholder.svg" : (product.images[activeImg] || "/placeholder.svg")}
                alt={product.name} fill
                className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                priority
                onError={() => setMainImgError(true)}
              />
              <span
                className="absolute bottom-4 left-4 z-[2] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[.62rem] font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "rgba(10, 11, 13,.7)", backdropFilter: "blur(8px)", border: "1px solid var(--line-2)", color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
              >
                <ZoomIn className="w-3 h-3" /> Click to zoom
              </span>
              {product.badge && (
                <span
                  className="absolute top-4 left-4 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.12em] uppercase"
                  style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
                >
                  {product.badge}
                </span>
              )}
              {isLowStock && (
                <span
                  className="absolute top-4 right-4 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.1em] uppercase"
                  style={{ background: "rgba(251,146,60,.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,.3)", fontFamily: "var(--font-space-mono)" }}
                >
                  Only {product.stock} left
                </span>
              )}
              <button
                onClick={handleShare}
                aria-label="Share product"
                className="absolute bottom-4 right-4 z-[3] w-9 h-9 rounded-full grid place-items-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
                style={{ background: "rgba(10, 11, 13,.7)", backdropFilter: "blur(8px)", border: "1px solid var(--line-2)" }}
              >
                <Share2 className="w-4 h-4" style={{ color: "var(--muted)" }} />
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
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
                    <Image src={thumbErrors[i] ? "/placeholder.svg" : img} alt={`View ${i + 1}`} fill className="object-cover opacity-75" onError={() => setThumbErrors((prev) => ({ ...prev, [i]: true }))} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-[.72rem] tracking-[.14em] uppercase mb-2 block" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
              {product.categorySlug.replace(/-/g, " ")}
            </span>
            <h1 className="uppercase leading-[.98] tracking-[.01em] mb-3" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3rem)" }}>
              {product.name}
            </h1>
            <p className="mb-4 text-[.95rem]" style={{ color: "var(--muted)" }}>{product.tagline}</p>

            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} reviews={product.reviews} size="md" />
              {product.reviews > 0 && (
                <a href="#reviews" className="text-xs transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  ({product.reviews} reviews)
                </a>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-[2.4rem]" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: "var(--text)" }}>
                {formatPrice(variant.price)}
              </div>
              {product.variants.length > 1 && selectedVariant > 0 && (
                <span className="text-sm" style={{ color: "var(--muted)" }}>for {variant.label}</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: product.inStock ? "rgba(74,222,128,.1)" : "rgba(239,68,68,.1)",
                  color: product.inStock ? "#4ade80" : "#ef4444",
                  border: `1px solid ${product.inStock ? "rgba(74,222,128,.2)" : "rgba(239,68,68,.2)"}`,
                  fontFamily: "var(--font-space-mono)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: product.inStock ? "#4ade80" : "#ef4444" }} />
                {product.inStock ? "In Stock — Ready to Ship" : "Out of Stock"}
              </div>
              {isLowStock && (
                <span className="text-[.72rem] font-semibold animate-pulse" style={{ color: "#fb923c", fontFamily: "var(--font-space-mono)" }}>
                  Only {product.stock} left — order soon!
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <p className="text-[.72rem] tracking-[.14em] uppercase mb-3" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                  Size / Option
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(i)}
                      className="inline-flex items-center px-4 py-2.5 rounded-[11px] text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        border: selectedVariant === i ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                        background: selectedVariant === i ? "rgba(79, 168, 230,.10)" : "var(--surface)",
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
              <p className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                Qty
              </p>
              <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
            </div>

            {/* CTAs */}
            <div ref={ctaRef} className="flex items-stretch gap-3 mb-6 flex-wrap">
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="btn-accent flex-1 min-w-[140px] py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-40 hover:-translate-y-0.5"
              >
                {added ? <><CheckCircle className="w-[18px] h-[18px]" /> Added!</> : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="btn-ghost flex-1 min-w-[140px] py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-40 hover:-translate-y-0.5"
              >
                <Zap className="w-[18px] h-[18px]" /> Buy Now
              </button>
              <div className="self-stretch flex items-center">
                <WishlistButton product={product} variant="inline" />
              </div>
            </div>

            {/* Sample request — order a small sample bucket before committing to a bulk order */}
            <div className="mb-6">
              <SampleRequestButton product={{ id: product.id, slug: product.slug, name: product.name }} variant="detail" />
            </div>

            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 mb-7 text-sm font-semibold transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--muted)" }}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#25d366" }} />
              Ask about this product on WhatsApp
            </a>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2.5">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3 rounded-[12px] px-4 py-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                  <div>
                    <p className="text-[.78rem] font-semibold leading-tight">{label}</p>
                    <p className="text-[.7rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="flex items-end gap-0" style={{ borderBottom: "1px solid var(--line)" }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="inline-flex items-center px-6 py-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap"
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
                  {!product.specs.length && (
                    <tr><td className="py-4 text-sm" style={{ color: "var(--muted)" }}>No specs listed.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16" style={{ borderTop: "1px solid var(--line)", paddingTop: "60px" }}>
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <h2 className="uppercase tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "2rem" }}>
                You May Also Like
              </h2>
              <Link
                href={`/categories/${product.categorySlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--muted)" }}
              >
                View all in {product.categorySlug.replace(/-/g, " ")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div id="reviews" className="mt-16" style={{ borderTop: "1px solid var(--line)", paddingTop: "60px" }}>
          <ReviewsSection productId={product.id} initialRating={product.rating} initialCount={product.reviews} />
        </div>
      </div>

      {/* Image lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-10"
          style={{ background: "rgba(6,5,4,.94)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image viewer`}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-5 right-5 w-11 h-11 rounded-full grid place-items-center cursor-pointer z-10"
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line-2)", color: "#fff" }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full h-full max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={product.images[activeImg] || "/placeholder.svg"}
              alt={`${product.name} — view ${activeImg + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {imgCount > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous image"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center cursor-pointer"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line-2)", color: "#fff" }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next image"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center cursor-pointer"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line-2)", color: "#fff" }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,.06)", color: "#fff", fontFamily: "var(--font-space-mono)" }}
              >
                {activeImg + 1} / {imgCount}
              </div>
            </>
          )}
        </div>
      )}

      {/* Sticky mobile CTA */}
      {stickyVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[55] flex items-center gap-3 px-4 py-3 md:hidden"
          style={{ background: "var(--surface)", borderTop: "1px solid var(--line-2)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{product.name}</p>
            <p className="text-[.78rem]" style={{ color: "var(--accent)", fontFamily: "var(--font-hanken)", fontWeight: 700 }}>
              {formatPrice(variant.price)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="btn-accent px-5 py-3 rounded-[11px] font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 flex-shrink-0"
          >
            {added ? <CheckCircle className="w-4 h-4" /> : null}
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
