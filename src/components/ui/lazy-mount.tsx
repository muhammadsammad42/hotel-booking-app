"use client";

import * as React from "react";

/**
 * Renders `fallback` until the block comes within `margin` of the screen,
 * then the real children. For heavy widgets below the fold, like maps.
 */
export function LazyMount({ children, fallback, margin = "400px", className }: { children: React.ReactNode; fallback: React.ReactNode; margin?: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
