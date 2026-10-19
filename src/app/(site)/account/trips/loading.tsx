import { Skeleton } from "@/components/ui/skeleton";

export default function TripsLoading() {
  return (
    <div className="grid gap-8" role="status" aria-label="Loading your trips">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-xl sm:w-80" />
      <div className="grid gap-4">
        {[0, 1].map((item) => (
          <div key={item} className="flex flex-col overflow-hidden rounded-xl border bg-card sm:flex-row">
            <Skeleton className="aspect-16/9 rounded-none sm:aspect-auto sm:h-44 sm:w-60" />
            <div className="grid flex-1 gap-3 p-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
