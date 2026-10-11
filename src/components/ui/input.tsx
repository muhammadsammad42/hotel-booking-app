import * as React from "react";

import { cn } from "@/lib/utils";

/** Shared look for text inputs, textareas and select triggers. */
const controlClasses = [
  "w-full min-w-0 rounded-lg border border-input bg-card px-3.5 text-base text-foreground md:text-[0.9375rem]",
  "transition-[border-color,box-shadow] duration-150 ease-soft outline-none",
  "placeholder:text-muted-foreground",
  "hover:border-foreground/70",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
];

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlClasses,
        "h-11 file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input, controlClasses };
