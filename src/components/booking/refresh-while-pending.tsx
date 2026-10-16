"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/** Re-checks the page every few seconds while a payment is being confirmed. */
export function RefreshWhilePending({ everyMs = 3000, maxTries = 10 }: { everyMs?: number; maxTries?: number }) {
  const router = useRouter();

  React.useEffect(() => {
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= maxTries) window.clearInterval(timer);
    }, everyMs);
    return () => window.clearInterval(timer);
  }, [router, everyMs, maxTries]);

  return null;
}
