import { PageContainer } from "@/components/layout/page-container";
import { HotelCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <>
      <div className="border-b bg-card/60">
        <PageContainer width="wide" className="py-4">
          <Skeleton className="h-11 w-full rounded-lg" />
        </PageContainer>
      </div>
      <PageContainer width="wide" className="py-6" role="status" aria-label="Loading stays">
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-11 w-48 rounded-lg" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)_minmax(0,0.8fr)]">
          <div className="hidden gap-4 lg:grid lg:content-start">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <HotelCardSkeleton key={index} />
            ))}
          </div>
          <Skeleton className="hidden h-[calc(100dvh-var(--spacing-header)-3rem)] rounded-2xl lg:block" />
        </div>
      </PageContainer>
    </>
  );
}
