"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

const colours = ["bg-primary", "bg-brass", "bg-secondary", "bg-success", "bg-primary-hover"];

type Piece = { id: number; x: number; drift: number; delay: number; rotate: number; size: number; colour: string; round: boolean };

function pieces(count: number, seed: number): Piece[] {
  // Small deterministic spread so it looks the same on every render.
  let state = seed;
  const random = () => ((state = (state * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: random() * 100,
    drift: (random() - 0.5) * 120,
    delay: random() * 0.35,
    rotate: (random() - 0.5) * 540,
    size: 6 + random() * 6,
    colour: colours[id % colours.length],
    round: random() > 0.6,
  }));
}

/** A short, gentle burst of confetti from the top of the screen. Skipped for reduced motion. */
export function Confetti({ count = 36 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = React.useState(true);
  const items = React.useMemo(() => pieces(count, 7), [count]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  if (reduce || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-dvh overflow-hidden" aria-hidden>
      {items.map((piece) => (
        <m.span
          key={piece.id}
          className={`absolute top-0 block ${piece.colour} ${piece.round ? "rounded-full" : "rounded-xs"}`}
          style={{ left: `${piece.x}%`, width: piece.size, height: piece.round ? piece.size : piece.size * 0.45 }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "70vh", x: piece.drift, rotate: piece.rotate, opacity: 0 }}
          transition={{ duration: 2.4, delay: piece.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
