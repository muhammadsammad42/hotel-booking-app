"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A panel that slides in from an edge. `side="bottom"` is the mobile pattern
 * for filters, date pickers and booking summaries; `side="right"` is used for
 * the mobile menu and side panels on larger screens.
 */
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const sheetVariants = cva(
  [
    "fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-overlay outline-none",
    "duration-250 ease-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200",
  ],
  {
    variants: {
      side: {
        bottom:
          "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        right:
          "inset-y-0 right-0 h-full w-[min(100%-3rem,24rem)] border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        left: "inset-y-0 left-0 h-full w-[min(100%-3rem,24rem)] border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        top: "inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  },
);

function SheetContent({
  className,
  children,
  side = "bottom",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> & { showCloseButton?: boolean }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-scrim duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {side === "bottom" && (
          <span className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border" aria-hidden />
        )}
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "absolute top-3 right-3")}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("grid gap-1.5 px-5 pt-5 pr-14", className)} {...props} />;
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-col gap-3 border-t px-5 py-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("type-title-md", className)} {...props} />;
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
