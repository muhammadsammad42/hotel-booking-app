import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

/** Placeholder lines for a paragraph; the last line is shorter. */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("grid gap-2.5", className)} aria-hidden>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-3.5", index === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/** Placeholder for a hotel card in a listing grid. */
function HotelCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-col overflow-hidden rounded-xl border bg-card", className)}
      role="status"
      aria-label="Loading hotel"
    >
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <div className="grid gap-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-4/5" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, HotelCardSkeleton };
