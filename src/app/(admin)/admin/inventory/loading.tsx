import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading inventory">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg sm:w-72" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid gap-1.5 overflow-hidden rounded-xl border bg-card p-4">
        {Array.from({ length: 10 }, (_, row) => (
          <div key={row} className="flex items-center gap-1">
            <Skeleton className="mr-3 h-4 w-40 shrink-0" />
            {Array.from({ length: 28 }, (_, cell) => (
              <Skeleton key={cell} className="size-6 shrink-0 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
