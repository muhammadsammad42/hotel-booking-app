import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Fractional change against the comparison period; null when there is nothing to compare. */
  change: number | null;
  comparison: string;
  hint?: string;
};

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

/** A headline number with a trend arrow against the last period. */
export function KpiCard({ label, value, icon: Icon, change, comparison, hint }: KpiCardProps) {
  const direction = change === null || Math.abs(change) < 0.005 ? "flat" : change > 0 ? "up" : "down";
  const Arrow = direction === "up" ? ArrowUpRightIcon : direction === "down" ? ArrowDownRightIcon : MinusIcon;
  const trend =
    change === null ? "New this period" : direction === "flat" ? "No change" : `${direction === "up" ? "+" : "−"}${percent.format(Math.abs(change))}`;

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
            direction === "up" && "bg-success/12 text-success",
            direction === "down" && "bg-destructive/10 text-destructive",
            direction === "flat" && "bg-muted text-muted-foreground",
          )}
        >
          <Arrow className="size-3.5" aria-hidden />
          <span className="sr-only">{direction === "up" ? "Up" : direction === "down" ? "Down" : ""}</span>
          {trend}
        </span>
        <span className="text-muted-foreground">{comparison}</span>
      </p>
      {hint && <p className="-mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
