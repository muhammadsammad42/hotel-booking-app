import * as React from "react";

import { cn } from "@/lib/utils";

const widths = {
  /** Editorial pages: home, search results, hotel pages. */
  page: "max-w-page",
  /** Booking flow, account and admin: narrower and denser. */
  app: "max-w-app",
  /** Long-form text. */
  prose: "max-w-prose",
} as const;

/** Centres content and applies the shared side gutter. */
function PageContainer({
  width = "page",
  className,
  ...props
}: React.ComponentProps<"div"> & { width?: keyof typeof widths }) {
  return (
    <div
      data-slot="page-container"
      className={cn("mx-auto w-full px-gutter", widths[width], className)}
      {...props}
    />
  );
}

/**
 * Vertical rhythm for a page section. `editorial` is generous; `compact` is
 * for the booking flow, account and admin.
 */
function Section({
  spacing = "editorial",
  className,
  ...props
}: React.ComponentProps<"section"> & { spacing?: "editorial" | "compact" }) {
  return (
    <section
      data-slot="section"
      className={cn(spacing === "editorial" ? "py-section" : "py-section-compact", className)}
      {...props}
    />
  );
}

export { PageContainer, Section };
