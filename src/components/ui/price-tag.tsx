import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { amount: "text-base", meta: "text-xs" },
  md: { amount: "text-xl", meta: "text-sm" },
  lg: { amount: "text-3xl", meta: "text-sm" },
} as const;

type PriceTagProps = {
  /** Amount in the smallest currency unit (cents). */
  amount: number;
  currency?: string;
  /** Earlier or standard price, shown struck through when it is higher. */
  originalAmount?: number;
  /** Text before the price, e.g. "From". */
  prefix?: string;
  /** What the price is for. Pass `null` for a total. */
  unit?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

/** A price with its unit. Always pass cents; formatting happens here. */
function PriceTag({
  amount,
  currency = "USD",
  originalAmount,
  prefix,
  unit = "night",
  size = "md",
  className,
}: PriceTagProps) {
  const showOriginal = originalAmount !== undefined && originalAmount > amount;

  return (
    <span
      data-slot="price-tag"
      className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}
    >
      {prefix && <span className={cn("text-muted-foreground", sizes[size].meta)}>{prefix}</span>}
      {showOriginal && (
        <span className={cn("text-muted-foreground line-through tabular-nums", sizes[size].meta)}>
          <span className="sr-only">Was </span>
          {formatPrice(originalAmount, currency)}
        </span>
      )}
      <span className={cn("font-semibold tracking-tight text-foreground tabular-nums", sizes[size].amount)}>
        {showOriginal && <span className="sr-only">Now </span>}
        {formatPrice(amount, currency)}
      </span>
      {unit && <span className={cn("text-muted-foreground", sizes[size].meta)}>/ {unit}</span>}
    </span>
  );
}

export { PriceTag };
