import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getFeaturedProducts } from "@/data/products";
import categories from "@/data/categories";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A.K. Auto Care — Professional Car Detailing Products",
  description:
    "Shop professional-grade car care products. Ceramic coatings, polishes, waxes, and detailing tools for the serious enthusiast.",
};

const trustItems = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders over £75" },
  { icon: Shield, title: "Secure Checkout", desc: "256-bit SSL encryption" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day hassle-free returns" },
  { icon: Star, title: "5-Star Rated", desc: "Trusted by 10,000+ detailers" },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80"
            alt="Luxury car detail"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#e8320a]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#e8320a]" />
              <span className="text-xs font-semibold text-gray-200 uppercase tracking-widest">
                Professional Grade Detailing
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Your Car.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8320a] to-[#ff6b3d]">
                Perfected.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8 max-w-xl">
              Professional-grade detailing chemistry trusted by enthusiasts and trade detailers.
              From wash to ceramic coat — we&apos;ve got your full workflow covered.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/categories/kits-bundles">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  View Bundles
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                { val: "10k+", label: "Happy Customers" },
                { val: "50+", label: "Products" },
                { val: "4.9★", label: "Average Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">{s.val}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Trust Strip ── */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-5">
                <div className="w-10 h-10 bg-[#e8320a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#e8320a]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f0f0f]">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Highlights ── */}
      <section className="bg-[#0a0a0a] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2">Browse by Category</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Find What You Need</h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
              All Products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group relative aspect-square overflow-hidden rounded-2xl">
                <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: cat.accent }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-bold leading-tight">{cat.name}</p>
                </div>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: cat.accent }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2">Hand-Picked</p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f0f0f]">Best Sellers</h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#e8320a] transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative py-24 overflow-hidden bg-[#0a0a0a]">
        <Image src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80" alt="Car polishing" fill className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-[#0a0a0a]/60" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#e8320a] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-3">New to Detailing?</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Start with our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8320a] to-[#ff6b3d]">Starter Kit</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Everything you need in one box. Our Full Detail Starter Kit saves you 23% vs buying separately.
          </p>
          <Link href="/products/full-detail-starter-kit">
            <Button size="lg">Get the Starter Kit <ArrowRight className="w-5 h-5" /></Button>
          </Link>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What Our Customers Say</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0f0f0f] mb-10">Trusted by Detailers Everywhere</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "James T.", location: "London", text: "The Armour Ceramic 9H is genuinely incredible. I've used professional coatings that perform worse. It's been water beading for 2 years.", rating: 5 },
              { name: "Sarah K.", location: "Manchester", text: "Ordered the starter kit as a gift. The packaging is premium, the products work amazingly, and the step-by-step guide was a lifesaver.", rating: 5 },
              { name: "Ravi P.", location: "Birmingham", text: "Cut King removed scratches I thought needed a respray. Combined with Gloss Finish polish the paint looks better than new.", rating: 5 },
            ].map((r) => (
              <div key={r.name} className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                <div className="flex mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <div>
                  <p className="font-bold text-[#0f0f0f] text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
