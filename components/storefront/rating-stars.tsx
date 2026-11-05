import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  className,
  starClassName,
  showValue = false,
  count,
}: {
  rating: number;
  className?: string;
  starClassName?: string;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i < Math.round(rating)
                ? "fill-gold text-gold"
                : "fill-transparent text-[var(--line-strong)]",
              starClassName
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-[0.7rem] font-medium tabular-nums text-muted-foreground">
          {rating.toFixed(1)}
          {typeof count === "number" && <span className="opacity-70"> ({count})</span>}
        </span>
      )}
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}
