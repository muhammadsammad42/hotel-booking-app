import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder rows shaped like an admin table. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card" aria-hidden>
      <div className="flex gap-6 border-b bg-muted/40 px-5 py-3">
        {[20, 28, 24, 16, 12].map((width, cell) => (
          <Skeleton key={cell} className="h-3" style={{ width: `${width}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-6 border-b px-5 py-4 last:border-b-0">
          {[20, 28, 24, 16, 12].map((width, cell) => (
            <Skeleton key={cell} className="h-4" style={{ width: `${width}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
