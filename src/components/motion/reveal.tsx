"use client";

import * as React from "react";
import * as m from "motion/react-m";

import { duration, ease } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  /** Seconds to wait before starting; use small steps to stagger a group. */
  delay?: number;
  className?: string;
};

/**
 * Fades content up as it scrolls into view, once. Decorative only: use it on
 * editorial sections, never on forms, booking steps or the first screen of
 * a page.
 */
function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: duration.reveal, ease: ease.soft, delay }}
    >
      {children}
    </m.div>
  );
}

export { Reveal };
