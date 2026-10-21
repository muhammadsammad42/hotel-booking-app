import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading the overview">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="grid gap-4 rounded-xl border bg-card p-5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="grid gap-4 rounded-xl border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <div className="flex h-64 items-end gap-3 pt-6">
              {[40, 65, 50, 80, 60, 90, 70, 55, 85, 75, 95, 60].map((height, bar) => (
                <Skeleton key={bar} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}
