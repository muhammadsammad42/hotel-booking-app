import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="grid gap-8" role="status" aria-label="Loading your profile">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid gap-5 rounded-2xl border bg-card p-6 md:grid-cols-[14rem_1fr] md:gap-8">
          <div className="grid content-start gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="grid gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
