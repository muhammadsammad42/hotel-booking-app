"use client";

import * as React from "react";
import Link from "next/link";
import { CircleAlertIcon, SaveIcon } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FormSection = { id: string; title: string; description: string };

/** Errors keyed by top-level field, plus per-image errors from paths like images.2.alt. */
export function collectErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  const images: Record<number, string> = {};
  for (const issue of error.issues) {
    const [key, index] = issue.path;
    if (key === "images" && typeof index === "number") images[index] ??= issue.message;
    else if (typeof key === "string") fields[key] ??= issue.message;
  }
  return { fields, images };
}

/** Moves focus to the first section that has an error. */
export function focusFirstError(sections: FormSection[], fieldsBySection: Record<string, string[]>, errors: Record<string, string>, imageErrors: Record<number, string>) {
  const section = sections.find(
    (item) => (fieldsBySection[item.id] ?? []).some((field) => errors[field]) || (item.id === "photos" && Object.keys(imageErrors).length > 0),
  );
  const target = section && document.getElementById(section.id);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  target?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus({ preventScroll: true });
}

/**
 * A long admin form split into sections, with a jump list on wide screens
 * and a save bar that stays in view.
 */
export function SectionedForm({
  sections,
  onSubmit,
  pending,
  dirty,
  submitLabel,
  cancelHref,
  formError,
  children,
}: {
  sections: FormSection[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  dirty: boolean;
  submitLabel: string;
  cancelHref: string;
  formError?: string;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="Form sections" className="hidden lg:block">
        <ol className="sticky top-24 grid gap-1 border-l text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-muted-foreground transition-colors duration-150 ease-soft hover:border-input hover:text-foreground">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="grid min-w-0 gap-6">
        {formError && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {formError}
          </p>
        )}
        {children}
        <div className="sticky bottom-0 z-10 -mx-gutter flex flex-wrap items-center justify-end gap-3 border-t bg-background/92 px-gutter py-3 backdrop-blur-md lg:-mx-8 lg:px-8">
          <p className={cn("mr-auto text-sm", dirty ? "text-warning" : "text-muted-foreground")} aria-live="polite">
            {dirty ? "You have unsaved changes" : "All changes saved"}
          </p>
          <Button asChild variant="ghost">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <Button type="submit" loading={pending}>
            <SaveIcon aria-hidden />
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function FormCard({ section, children }: { section: FormSection; children: React.ReactNode }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="grid scroll-mt-24 gap-5 rounded-xl border bg-card p-5 sm:p-6">
      <div>
        <h2 id={`${section.id}-title`} className="type-title-md">
          {section.title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{section.description}</p>
      </div>
      {children}
    </section>
  );
}
