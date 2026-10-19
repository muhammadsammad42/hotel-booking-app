"use client";

import * as React from "react";
import * as m from "motion/react-m";
import { Tabs as TabsPrimitive } from "radix-ui";

import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AnimatedTab = {
  value: string;
  label: string;
  /** Shown as a small count after the label. */
  count?: number;
  content: React.ReactNode;
};

type AnimatedTabsProps = {
  tabs: AnimatedTab[];
  defaultValue: string;
  /** Keeps the open tab in this query parameter, so links and Back restore it. */
  param?: string;
  label: string;
  className?: string;
};

/**
 * Segmented tabs for app screens. The active chip slides between tabs and the
 * panel fades in on switch (not on first render, so the page does not jump).
 */
export function AnimatedTabs({ tabs, defaultValue, param, label, className }: AnimatedTabsProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [switched, setSwitched] = React.useState(false);
  const id = React.useId();

  function change(next: string) {
    setValue(next);
    setSwitched(true);
    if (param) {
      const url = new URL(window.location.href);
      if (next === tabs[0]?.value) url.searchParams.delete(param);
      else url.searchParams.set(param, next);
      window.history.replaceState(window.history.state, "", url);
    }
  }

  return (
    <TabsPrimitive.Root value={value} onValueChange={change} className={cn("flex min-w-0 flex-col gap-6", className)}>
      <TabsPrimitive.List
        aria-label={label}
        className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted p-1 sm:w-fit"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className="relative inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm sm:gap-2 sm:px-4 font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors duration-150 ease-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:text-foreground pointer-coarse:min-h-11 sm:flex-none"
          >
            {value === tab.value && (
              <m.span
                layoutId={`${id}-chip`}
                className="absolute inset-0 rounded-lg bg-card shadow-xs"
                transition={{ duration: duration.base, ease: ease.soft }}
                aria-hidden
              />
            )}
            <span className="relative">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="relative rounded-full bg-background/70 px-1.5 text-xs tabular-nums text-muted-foreground">
                {tab.count}
              </span>
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content key={tab.value} value={tab.value} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <m.div
            initial={switched ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, ease: ease.soft }}
          >
            {tab.content}
          </m.div>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
