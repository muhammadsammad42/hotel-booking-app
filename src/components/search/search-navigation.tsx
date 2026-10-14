"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { searchHref, type SearchFilters } from "@/lib/search/params";

type SearchNavigationValue = {
  filters: SearchFilters;
  /** True while new results are loading. */
  pending: boolean;
  /** Updates the URL with changed filters. Any change except paging resets to page 1. */
  update: (changes: Partial<SearchFilters>) => void;
};

const SearchNavigationContext = React.createContext<SearchNavigationValue | null>(null);

/** Shares the current filters and a pending flag between filters, sort and results. */
export function SearchNavigationProvider({ filters, children }: { filters: SearchFilters; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const update = React.useCallback(
    (changes: Partial<SearchFilters>) => {
      const next = { ...filters, ...changes, page: changes.page ?? 1 };
      startTransition(() => router.push(searchHref(next), { scroll: false }));
    },
    [filters, router],
  );

  return (
    <SearchNavigationContext.Provider value={{ filters, pending, update }}>{children}</SearchNavigationContext.Provider>
  );
}

export function useSearchNavigation() {
  const context = React.useContext(SearchNavigationContext);
  if (!context) throw new Error("useSearchNavigation must be used inside SearchNavigationProvider");
  return context;
}
