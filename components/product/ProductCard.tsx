"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.variants[0]);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAdd}
              className="w-10 h-10 rounded-full bg-[#e8320a] text-white flex items-center justify-center shadow-lg hover:bg-[#c42a08] transition-colors"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white text-[#0f0f0f] flex items-center justify-center shadow-lg">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <Badge variant={product.badge === "Premium" ? "dark" : "accent"}>
                {product.badge}
              </Badge>
            </div>
          )}
          {/* Stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-medium">
            {product.categorySlug.replace(/-/g, " ")}
          </p>
          <h3 className="font-bold text-[#0f0f0f] text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-[#e8320a] transition-colors">
            {product.name}
          </h3>
          <StarRating rating={product.rating} reviews={product.reviews} />
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-black text-[#0f0f0f]">
                {formatPrice(product.price)}
              </span>
              {product.variants.length > 1 && (
                <span className="text-xs text-gray-400 ml-1">from</span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="text-xs font-semibold text-[#e8320a] hover:text-[#c42a08] disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
