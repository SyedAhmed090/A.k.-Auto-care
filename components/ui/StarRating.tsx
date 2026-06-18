import { memo } from "react";
import { Star, StarHalf } from "lucide-react";

function StarRating({ rating, reviews, size = "sm" }: {
  rating: number; reviews?: number; size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const filled = "#fbbf24";
  const empty = "var(--line-2)";

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center"
        role="img"
        aria-label={`Rated ${rating} out of 5 stars${reviews !== undefined ? `, ${reviews} reviews` : ''}`}
      >
        {[1, 2, 3, 4, 5].map((s) => {
          // Full star when rating reaches this position; half star when the
          // rating lands within the lower half of this position (e.g. 3.5 -> 4th is half).
          const isFull = rating >= s - 0.25;
          const isHalf = !isFull && rating >= s - 0.75;

          if (isHalf) {
            // StarHalf only fills the left side; layer it over an empty star.
            return (
              <span key={s} className={`relative inline-flex ${sizeClass}`} aria-hidden="true">
                <Star className={`absolute inset-0 fill-current ${sizeClass}`} style={{ color: empty }} />
                <StarHalf className={`absolute inset-0 fill-current ${sizeClass}`} style={{ color: filled }} />
              </span>
            );
          }

          return (
            <Star
              key={s}
              aria-hidden="true"
              className={`fill-current ${sizeClass}`}
              style={{ color: isFull ? filled : empty }}
            />
          );
        })}
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

export default memo(StarRating);
