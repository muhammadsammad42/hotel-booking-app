import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AmenitiesLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading amenities">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
