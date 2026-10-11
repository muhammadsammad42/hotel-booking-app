import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StepperProps = {
  steps: string[];
  /** Zero-based index of the step the guest is on. */
  current: number;
  className?: string;
};

/**
 * Progress through a fixed sequence, such as the booking flow. On small
 * screens only the current step shows its label.
 */
function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav aria-label="Progress" data-slot="stepper" className={className}>
      <p className="mb-3 text-sm text-muted-foreground sm:hidden">
        Step {current + 1} of {steps.length}
      </p>
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((label, index) => {
          const state = index < current ? "done" : index === current ? "current" : "upcoming";
          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className={cn("flex items-center gap-2 sm:gap-3", index < steps.length - 1 && "flex-1")}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-200 ease-soft",
                  state === "done" && "border-primary bg-primary text-primary-foreground",
                  state === "current" && "border-primary bg-card text-primary ring-4 ring-primary/15",
                  state === "upcoming" && "border-input bg-card text-muted-foreground",
                )}
              >
                {state === "done" ? <CheckIcon className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  state === "current" ? "font-semibold text-foreground" : "text-muted-foreground",
                  state !== "current" && "sr-only sm:not-sr-only",
                )}
              >
                {state === "done" && <span className="sr-only">Completed: </span>}
                {label}
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px min-w-4 flex-1 transition-colors duration-200 ease-soft",
                    state === "done" ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Stepper };
