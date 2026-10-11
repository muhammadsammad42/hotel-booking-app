"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // The ::after pseudo-element extends the hit area to 44px.
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-sm border border-input bg-card",
        "transition-[background-color,border-color,box-shadow] duration-150 ease-soft outline-none",
        "after:absolute after:-inset-3",
        "hover:border-foreground/70",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center">
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
