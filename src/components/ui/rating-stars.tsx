import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const sizes = {
  sm: { star: "size-3.5", text: "text-xs" },
  md: { star: "size-4", text: "text-sm" },
  lg: { star: "size-5", text: "text-base" },
} as const;

type RatingStarsProps = {
  /** Average rating from 0 to 5; fractions fill a star partially. */
  value: number;
  /** Number of reviews, shown in brackets after the value. */
  count?: number;
  size?: keyof typeof sizes;
  /** Show the numeric value next to the stars. */
  showValue?: boolean;
  className?: string;
};

/** Read-only star rating. Screen readers get one sentence, not five icons. */
function RatingStars({ value, count, size = "md", showValue = true, className }: RatingStarsProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const label =
    count === undefined
      ? `Rated ${clamped.toFixed(1)} out of 5`
      : `Rated ${clamped.toFixed(1)} out of 5 from ${count} ${count === 1 ? "review" : "reviews"}`;

  return (
    <span
      data-slot="rating-stars"
      role="img"
      aria-label={label}
      className={cn("inline-flex items-center gap-1.5", sizes[size].text, className)}
    >
      <span className="relative inline-flex" aria-hidden>
        <span className="flex gap-0.5 text-border">
          {Array.from({ length: 5 }, (_, index) => (
            <StarIcon key={index} className={cn(sizes[size].star, "fill-current")} strokeWidth={0} />
          ))}
        </span>
        <span
          className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-star"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <StarIcon
              key={index}
              className={cn(sizes[size].star, "shrink-0 fill-current")}
              strokeWidth={0}
            />
          ))}
        </span>
      </span>
      {showValue && (
        <span aria-hidden className="font-semibold text-foreground tabular-nums">
          {clamped.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span aria-hidden className="text-muted-foreground tabular-nums">
          ({count})
        </span>
      )}
    </span>
  );
}

export { RatingStars };
