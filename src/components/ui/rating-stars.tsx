import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  showNumber?: boolean;
  count?: number;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({ rating, max = 5, showNumber = true, count, size = "sm" }: RatingStarsProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5";
  const hasReviews = count !== undefined && count > 0;

  if (!hasReviews) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          New Instructor
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`${iconSize} ${
              i < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200 fill-slate-100"
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-800">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-500">({count})</span>
      )}
    </div>
  );
}
