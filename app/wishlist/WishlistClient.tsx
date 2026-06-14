"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";

export default function WishlistClient() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-10 pb-12" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
            Saved Items
          </p>
          <h1 className="text-4xl sm:text-5xl font-black" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>
            My Wishlist
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!mounted ? null : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-full grid place-items-center mb-5" style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}>
              <Heart className="w-7 h-7" style={{ color: "var(--muted)" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
              Your wishlist is empty
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Tap the heart on any product to save it here for later.
            </p>
            <Link href="/shop" className="px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="relative group rounded-[var(--r)] overflow-hidden flex flex-col h-full product-card">
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full grid place-items-center transition-all hover:scale-110 cursor-pointer backdrop-blur-md"
                  style={{ background: "rgba(10, 11, 13,.55)", border: "1px solid var(--line-2)" }}
                >
                  <X className="w-[17px] h-[17px]" style={{ color: "#fff" }} />
                </button>
                <Link href={`/products/${item.slug}`} className="block">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3", background: "radial-gradient(70% 70% at 50% 40%,#16191f,#0a0b0d)" }}>
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-all duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5 flex flex-col gap-1.5">
                    <span className="font-semibold text-[1.05rem] leading-tight line-clamp-2" style={{ color: "var(--text)" }}>{item.name}</span>
                    <StarRating rating={item.rating} reviews={item.reviews} />
                    <span className="text-[1.35rem] mt-2" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: "var(--text)" }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
