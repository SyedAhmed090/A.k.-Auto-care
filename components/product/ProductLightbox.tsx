"use client";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Full-screen image viewer for the product gallery. Extracted into its own module and
 * loaded with next/dynamic(ssr:false) so its code is only fetched when a shopper actually
 * opens the lightbox — keeping it out of the initial product-page bundle.
 */
export default function ProductLightbox({
  images,
  index,
  productName,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  productName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const count = images.length;
  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-10"
      style={{ background: "rgba(6,5,4,.94)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} image viewer`}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 w-11 h-11 rounded-full grid place-items-center cursor-pointer z-10"
        style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line-2)", color: "#fff" }}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full h-full max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[index] || "/placeholder.svg"}
          alt={`${productName} — view ${index + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
        />
      </div>

      {count > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center cursor-pointer"
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line-2)", color: "#fff" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
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
            {index + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}
