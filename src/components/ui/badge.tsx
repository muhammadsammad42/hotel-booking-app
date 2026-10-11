import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        brass: "border-transparent bg-brass text-brass-foreground",
        outline: "border-input bg-transparent text-foreground",
        success: "border-success/30 bg-success/12 text-success",
        warning: "border-warning/30 bg-warning/12 text-warning",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
