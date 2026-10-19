import { HotelCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading your wishlist">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <HotelCardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
}
