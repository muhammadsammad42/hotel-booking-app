import * as React from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Usually one primary Button, optionally with a secondary action. */
  action?: React.ReactNode;
  /** `error` tints the illustration for failed loads. */
  tone?: "default" | "error";
  /** Heading level for the title; pick the one that fits the page outline. */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
};

/** Shown when a list has nothing in it, a search finds nothing, or a load fails. */
function EmptyState({
  title,
  description,
  action,
  tone = "default",
  headingLevel: Heading = "h2",
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center", className)}
    >
      <ArchIllustration tone={tone} />
      <Heading className="type-display-md mt-6">{title}</Heading>
      {description && <p className="mt-2 leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

/** An empty archway on the horizon: the sarai gate with nobody in it yet. */
function ArchIllustration({ tone }: { tone: "default" | "error" }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={cn("h-28 w-auto", tone === "error" ? "text-destructive" : "text-primary")}
      fill="none"
      aria-hidden
    >
      <circle cx="116" cy="34" r="13" className="fill-brass/50" />
      <path d="M8 100h144" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M50 100V58c0-17 12-27 30-38 18 11 30 21 30 38v42"
        className="fill-muted stroke-current"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M64 100V66c0-10 7-16 16-22 9 6 16 12 16 22v34"
        className="fill-background stroke-current"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M26 100c6-9 14-13 24-13" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      <path d="M110 88c11 0 19 4 25 12" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="34" r="2.5" className="fill-current" />
    </svg>
  );
}

export { EmptyState };
