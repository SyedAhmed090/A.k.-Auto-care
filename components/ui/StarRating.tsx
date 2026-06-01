import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({
  rating,
  reviews,
  size = "sm",
}: {
  rating: number;
  reviews?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "fill-current",
              star <= Math.round(rating) ? "text-amber-400" : "text-gray-300",
              size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5"
            )}
          />
        ))}
      </div>
      {reviews !== undefined && (
        <span className={cn("text-gray-500", size === "sm" ? "text-xs" : "text-sm")}>
          ({reviews})
        </span>
      )}
    </div>
  );
}
