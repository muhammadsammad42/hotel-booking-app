"use client";

import * as React from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { duration, ease } from "@/lib/motion";

/** Client-side providers shared by every page. */
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* LazyMotion keeps the animation code out of the initial bundle;
          reducedMotion="user" honours the system setting. */}
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.soft }}>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </MotionConfig>
      </LazyMotion>
      <Toaster />
    </ThemeProvider>
  );
}

export { Providers };
