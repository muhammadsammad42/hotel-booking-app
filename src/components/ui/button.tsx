import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent",
    "font-sans font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-soft",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "aria-busy:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        // The one obvious action on a screen: search, reserve, pay.
        primary: "bg-primary text-primary-foreground shadow-cta hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        outline: "border-input bg-card text-foreground hover:border-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "rounded-sm text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        // Sizes below 44px grow to 44px on touch screens.
        sm: "h-9 px-3.5 text-sm pointer-coarse:min-h-11",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "size-11",
        "icon-sm": "size-9 pointer-coarse:size-11",
        // For the link variant, which sits inline with text.
        inline: "text-[length:inherit]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner and blocks clicks while keeping the width of the button. */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const resolvedSize = size ?? (variant === "link" ? "inline" : "md");
  const classes = cn(buttonVariants({ variant, size: resolvedSize, fullWidth }), className);

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button data-slot="button" className={classes} aria-busy={loading || undefined} {...props}>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
        </span>
      )}
      <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
    </button>
  );
}

export { Button, buttonVariants };
