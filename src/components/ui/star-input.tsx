"use client";

import * as React from "react";
import { CircleAlertIcon, StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const labels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

type StarInputProps = {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  size?: "md" | "lg";
  error?: string;
};

/**
 * A 1-5 rating made of native radio buttons, so arrow keys, screen readers
 * and forms work as usual. Stars fill up to the hovered or chosen one.
 */
export function StarInput({ name, label, value, onChange, size = "md", error }: StarInputProps) {
  const [hover, setHover] = React.useState(0);
  const shown = hover || value;
  const errorId = React.useId();

  return (
    <fieldset className="grid gap-1.5" aria-describedby={error ? errorId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {labels.map((text, index) => {
            const score = index + 1;
            return (
              <label
                key={score}
                onMouseEnter={() => setHover(score)}
                className={cn(
                  "group/star flex cursor-pointer items-center justify-center rounded-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  size === "lg" ? "size-11" : "size-9 pointer-coarse:size-11",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={score}
                  checked={value === score}
                  onChange={() => onChange(score)}
                  className="sr-only"
                />
                <span className="sr-only">
                  {score} {score === 1 ? "star" : "stars"}, {text}
                </span>
                <StarIcon
                  aria-hidden
                  strokeWidth={1.5}
                  className={cn(
                    "transition-[color,fill,transform] duration-150 ease-soft group-active/star:scale-90",
                    size === "lg" ? "size-8" : "size-6",
                    score <= shown ? "fill-star text-star" : "fill-transparent text-input",
                    hover === score && "scale-110",
                  )}
                />
              </label>
            );
          })}
        </div>
        <span className="min-w-20 text-sm text-muted-foreground" aria-hidden>
          {shown ? labels[shown - 1] : ""}
        </span>
      </div>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-destructive">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </fieldset>
  );
}
