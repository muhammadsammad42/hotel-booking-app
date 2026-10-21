import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for the sectioned hotel and room type forms. */
export function FormSkeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-6" role="status" aria-label={label}>
      <Skeleton className="h-5 w-24" />
      <div className="grid gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
        <div className="hidden gap-3 lg:grid lg:content-start">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-4 w-24" />
          ))}
        </div>
        <div className="grid gap-6">
          {[0, 1].map((card) => (
            <div key={card} className="grid gap-5 rounded-xl border bg-card p-6">
              <Skeleton className="h-5 w-32" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Skeleton className="h-11 rounded-lg" />
                <Skeleton className="h-11 rounded-lg" />
              </div>
              <Skeleton className="h-28 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
