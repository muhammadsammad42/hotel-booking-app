import { Skeleton } from "@/components/ui/skeleton";

export default function HotelsLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading hotels">
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="overflow-hidden rounded-xl border bg-card">
            <Skeleton className="aspect-16/9 rounded-none" />
            <div className="grid gap-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
