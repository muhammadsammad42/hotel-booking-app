import { PageContainer } from "@/components/layout/page-container";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function HotelLoading() {
  return (
    <PageContainer className="pt-6 md:pt-8" role="status" aria-label="Loading hotel">
      <div className="grid h-[min(60vh,32rem)] gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2">
        <Skeleton className="rounded-none md:col-span-2 md:row-span-2" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="hidden rounded-none md:block" />
        ))}
      </div>
      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <div className="grid content-start gap-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-64" />
          <SkeletonText lines={5} className="mt-6" />
        </div>
        <Skeleton className="hidden h-96 rounded-2xl lg:block" />
      </div>
    </PageContainer>
  );
}
