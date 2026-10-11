"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * `underline` suits editorial pages (hotel overview / rooms / reviews).
 * `segmented` is a compact switch for app screens (upcoming / past bookings).
 */
function Tabs({
  className,
  variant = "underline",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { variant?: "underline" | "segmented" }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-variant={variant}
      className={cn("group/tabs flex flex-col gap-5", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex max-w-full items-center overflow-x-auto",
        "group-data-[variant=underline]/tabs:gap-6 group-data-[variant=underline]/tabs:border-b",
        "group-data-[variant=segmented]/tabs:w-fit group-data-[variant=segmented]/tabs:gap-1 group-data-[variant=segmented]/tabs:rounded-xl group-data-[variant=segmented]/tabs:bg-muted group-data-[variant=segmented]/tabs:p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
        "transition-[color,background-color,box-shadow] duration-150 ease-soft hover:text-foreground",
        "data-[state=active]:text-foreground disabled:pointer-events-none disabled:opacity-50",
        // Underline: a terracotta rule under the active tab.
        "group-data-[variant=underline]/tabs:-mb-px group-data-[variant=underline]/tabs:border-b-2 group-data-[variant=underline]/tabs:border-transparent group-data-[variant=underline]/tabs:px-0.5 group-data-[variant=underline]/tabs:data-[state=active]:border-primary",
        // Segmented: the active tab is a raised chip.
        "group-data-[variant=segmented]/tabs:min-h-9 group-data-[variant=segmented]/tabs:rounded-lg group-data-[variant=segmented]/tabs:px-4 group-data-[variant=segmented]/tabs:data-[state=active]:bg-card group-data-[variant=segmented]/tabs:data-[state=active]:shadow-xs pointer-coarse:group-data-[variant=segmented]/tabs:min-h-11",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("rounded-md", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
