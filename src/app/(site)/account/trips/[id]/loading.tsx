import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function TripLoading() {
  return (
    <div className="grid gap-8" role="status" aria-label="Loading your trip">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="aspect-16/9 w-full rounded-2xl sm:aspect-21/9" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-14 w-48 rounded-xl" />
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-5 rounded-2xl border bg-card p-6">
          <Skeleton className="h-5 w-28" />
          <SkeletonText lines={4} />
        </div>
        <div className="grid gap-4 rounded-2xl border bg-card p-5">
          <Skeleton className="h-5 w-32" />
          <SkeletonText lines={4} />
        </div>
      </div>
    </div>
  );
}
