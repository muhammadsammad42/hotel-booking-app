import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { FilterSheet, FilterSidebar } from "@/components/search/filter-panel";
import { ResultCount, SortSelect } from "@/components/search/results-toolbar";
import { SearchForm } from "@/components/search/search-form";
import { SearchNavigationProvider } from "@/components/search/search-navigation";
import { SearchResults } from "@/components/search/search-results";
import { getCurrentUser } from "@/lib/auth/guards";
import { STAY_ERROR_MESSAGES, todayIso, validateStay } from "@/lib/booking/stay";
import { getDestinationSuggestions, getFilterAmenities, searchHotels } from "@/lib/catalog/hotels";
import { parseSearchParams } from "@/lib/search/params";
import { getWishlistIds } from "@/lib/wishlist/queries";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { destination } = parseSearchParams(await searchParams);
  return {
    title: destination ? `Stays in ${destination}` : "Find a stay",
    description: destination
      ? `Hand-picked hotels in ${destination}, with real reviews and clear prices.`
      : "Search hand-picked hotels by destination, dates and guests.",
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const parsed = parseSearchParams(await searchParams);
  // Dates must also pass the booking rules (not in the past, not too long).
  const stay = parsed.checkIn && parsed.checkOut ? validateStay(parsed.checkIn, parsed.checkOut, todayIso()) : null;
  const dateNotice = stay && !stay.ok ? STAY_ERROR_MESSAGES[stay.error] : null;
  const filters = stay && !stay.ok ? { ...parsed, checkIn: null, checkOut: null } : parsed;
  const user = await getCurrentUser();
  const [suggestions, amenities, result, savedIds] = await Promise.all([
    getDestinationSuggestions(),
    getFilterAmenities(),
    searchHotels(filters, stay?.ok ? { checkIn: stay.checkIn, checkOut: stay.checkOut } : null),
    getWishlistIds(user?.id),
  ]);
  const options = { amenities, priceBounds: result.priceBounds };

  return (
    <SearchNavigationProvider filters={filters}>
      <div className="border-b bg-card/60">
        <PageContainer width="wide" className="py-4">
          <h1 className="sr-only">Find a stay</h1>
          <SearchForm
            variant="bar"
            suggestions={suggestions}
            initial={filters}
            keep={{ ...filters, destination: undefined, checkIn: undefined, checkOut: undefined, guests: undefined }}
          />
        </PageContainer>
      </div>

      <PageContainer width="wide" className="py-6 pb-24 lg:pb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <ResultCount total={result.total} destination={filters.destination} />
            {dateNotice && (
              <p role="status" className="text-sm text-warning">
                {dateNotice} Showing stays for any dates.
              </p>
            )}
            {stay?.ok && (
              <p className="text-sm text-muted-foreground">
                Available for all {stay.nights} {stay.nights === 1 ? "night" : "nights"}, priced for your dates.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FilterSheet options={options} total={result.total} />
            <SortSelect />
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)_minmax(0,0.8fr)]">
          <FilterSidebar options={options} />
          <SearchResults
            hotels={result.hotels}
            page={result.page}
            pageCount={result.pageCount}
            savedIds={[...savedIds]}
            signedIn={Boolean(user)}
            priceLabel="From"
          />
        </div>
      </PageContainer>
    </SearchNavigationProvider>
  );
}
