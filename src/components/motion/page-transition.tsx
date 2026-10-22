"use client";

import * as React from "react";

// Pages fade in when the guest moves between them, but not on the first
// load: that would hide the first paint and slow it down.
let hydrated = false;

/** Used by route templates, which remount on every navigation. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const [animate] = React.useState(() => {
    if (typeof window === "undefined") return false;
    const navigated = hydrated;
    hydrated = true;
    return navigated;
  });
  return <div className={animate ? "page-in flex flex-1 flex-col" : "flex flex-1 flex-col"}>{children}</div>;
}
