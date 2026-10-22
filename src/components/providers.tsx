"use client";

import * as React from "react";
import { LazyMotion, MotionConfig } from "motion/react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { duration, ease } from "@/lib/motion";

// The animation features load in their own chunk after the page has started;
// until then, m components render as plain elements.
const loadMotionFeatures = () => import("@/lib/motion-features").then((module) => module.default);

/** Client-side providers shared by every page. */
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* reducedMotion="user" honours the system setting. */}
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.soft }}>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </MotionConfig>
      </LazyMotion>
      <Toaster />
    </ThemeProvider>
  );
}

export { Providers };
