import { Star } from "lucide-react";

export default function StarRating({ rating, reviews, size = "sm" }: {
  rating: number; reviews?: number; size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`fill-current ${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`}
            style={{ color: s <= Math.round(rating) ? "var(--accent)" : "var(--line-2)" }}
          />
        ))}
      </div>
      {reviews !== undefined && (
        <span
          className="text-[.62rem] leading-none"
          style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
        >
          ({reviews})
        </span>
      )}
    </div>
  );
}
