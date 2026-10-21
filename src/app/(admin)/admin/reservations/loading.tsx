import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReservationsLoading() {
  return (
    <div className="grid gap-5" role="status" aria-label="Loading reservations">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-[4.5rem] w-full rounded-xl" />
      <TableSkeleton rows={10} />
    </div>
  );
}
