import { Skeleton } from "@/components/ui/skeleton";

export default function RatesLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading rates">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg sm:w-96" />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6 2xl:grid-cols-2">
          {[0, 1].map((month) => (
            <div key={month} className="grid gap-3 rounded-xl border bg-card p-4">
              <Skeleton className="h-4 w-28" />
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, day) => (
                  <Skeleton key={day} className="h-16 rounded-lg sm:h-[4.5rem]" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
