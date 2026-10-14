"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { useSearchNavigation } from "@/components/search/search-navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { duration, ease } from "@/lib/motion";
import { searchHref, type Sort } from "@/lib/search/params";
import { cn } from "@/lib/utils";

const sortLabels: Record<Sort, string> = {
  recommended: "Recommended",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Guest rating",
};

/** "6 stays in Bali", with the number rolling when it changes. */
export function ResultCount({ total, destination }: { total: number; destination: string }) {
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      <span className="relative inline-flex overflow-hidden align-bottom font-semibold text-foreground tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={total}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: duration.base, ease: ease.soft }}
          >
            {total}
          </m.span>
        </AnimatePresence>
      </span>{" "}
      {total === 1 ? "stay" : "stays"}
      {destination ? ` matching “${destination}”` : " across all destinations"}
    </p>
  );
}

export function SortSelect() {
  const { filters, update } = useSearchNavigation();
  return (
    <Select value={filters.sort} onValueChange={(sort) => update({ sort: sort as Sort })}>
      <SelectTrigger className="w-auto min-w-48" aria-label="Sort results">
        <span className="text-muted-foreground">Sort:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {(Object.keys(sortLabels) as Sort[]).map((sort) => (
          <SelectItem key={sort} value={sort}>
            {sortLabels[sort]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const { filters } = useSearchNavigation();
  if (pageCount <= 1) return null;
  const href = (target: number) => searchHref({ ...filters, page: target });

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-4">
      <Button asChild variant="outline" size="icon" className={cn(page <= 1 && "pointer-events-none opacity-40")}>
        <Link href={href(page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined}>
          <ChevronLeftIcon aria-hidden />
          <span className="sr-only">Previous page</span>
        </Link>
      </Button>
      <ul className="flex items-center gap-1">
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((target) => (
          <li key={target}>
            <Link
              href={href(target)}
              aria-current={target === page ? "page" : undefined}
              className="flex size-11 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors duration-150 ease-soft hover:bg-accent aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {target}
            </Link>
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn(page >= pageCount && "pointer-events-none opacity-40")}
      >
        <Link href={href(page + 1)} aria-disabled={page >= pageCount} tabIndex={page >= pageCount ? -1 : undefined}>
          <ChevronRightIcon aria-hidden />
          <span className="sr-only">Next page</span>
        </Link>
      </Button>
    </nav>
  );
}
