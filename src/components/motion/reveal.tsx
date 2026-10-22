"use client";

import * as React from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Seconds to wait before starting; use small steps to stagger a group. */
  delay?: number;
  className?: string;
};

/**
 * Fades content up as it scrolls into view, once. Decorative only: use it on
 * editorial sections, never on forms, booking steps or the first screen.
 *
 * The content is rendered visible on the server. Only elements that are
 * still below the fold once the page is interactive are hidden and then
 * revealed, so a slow script never leaves a section invisible.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // The observer reports positions asynchronously, so nothing here forces
    // a layout while the page is starting. Its first report says whether the
    // element starts below the fold; only then is it hidden, to fade in later.
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            observer.disconnect();
            return;
          }
          element.dataset.reveal = "hidden";
          return;
        }
        if (!entry.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}
