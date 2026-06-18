"use client";
import { memo } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { useWishlistStore } from "@/store/wishlist";
import { useMounted } from "@/lib/useMounted";

/**
 * Heart toggle for saving a product to the wishlist.
 * `variant="overlay"` is the small circular button used on product cards;
 * "inline" is a larger bordered button for the product detail page.
 */
function WishlistButton({
  product,
  variant = "overlay",
}: {
  product: Product;
  variant?: "overlay" | "inline";
}) {
  const toggle = useWishlistStore((s) => s.toggle);
  const items = useWishlistStore((s) => s.items);
  const mounted = useMounted();

  const active = mounted && items.some((i) => i.id === product.id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        className="w-12 h-12 rounded-[13px] grid place-items-center flex-shrink-0 transition-all cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        style={{
          border: `1px solid ${active ? "var(--accent)" : "var(--line-2)"}`,
          background: active ? "rgba(79, 168, 230,.08)" : "var(--surface)",
        }}
      >
        <Heart className="w-5 h-5" style={{ color: active ? "var(--accent)" : "var(--muted)", fill: active ? "var(--accent)" : "transparent" }} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full grid place-items-center transition-all cursor-pointer backdrop-blur-md hover:scale-110 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
    >
      <Heart className="w-[17px] h-[17px]" style={{ color: active ? "var(--accent)" : "var(--muted)", fill: active ? "var(--accent)" : "transparent" }} />
    </button>
  );
}

export default memo(WishlistButton);
