"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Paragraphs shown in full when short, or clamped with a "Read more" toggle. */
export function ReadMore({ text, lines = 4 }: { text: string; lines?: number }) {
  const id = React.useId();
  const [expanded, setExpanded] = React.useState(false);
  const paragraphs = text.split(/\n\s*\n/);
  const long = text.length > 320;

  return (
    <div>
      <div
        id={id}
        className={cn("grid gap-4 leading-relaxed text-foreground/90", long && !expanded && "line-clamp-(--lines)")}
        style={{ "--lines": lines } as React.CSSProperties}
      >
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      {long && (
        <Button
          variant="link"
          className="mt-3"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDownIcon className={cn("transition-transform duration-200 ease-soft", expanded && "rotate-180")} aria-hidden />
        </Button>
      )}
    </div>
  );
}
