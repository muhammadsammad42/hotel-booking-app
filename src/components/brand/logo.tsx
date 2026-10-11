import { cn } from "@/lib/utils";

import { WORDMARK } from "./wordmark";

const MARK_SIZE = 32;
const WORDMARK_HEIGHT = 21;
const GAP = 10;
const wordmarkScale = WORDMARK_HEIGHT / WORDMARK.height;
const fullWidth = MARK_SIZE + GAP + WORDMARK.width * wordmarkScale;

type LogoProps = {
  /** `full` is the mark with the wordmark; `mark` is the archway tile alone. */
  variant?: "full" | "mark";
  /** Set the height here, e.g. "h-8". The width follows. */
  className?: string;
};

/**
 * The Sarai logo: a pointed archway, the gate of a caravanserai, beside the
 * name set in Fraunces. The wordmark takes the current text colour.
 */
function Logo({ variant = "full", className }: LogoProps) {
  const width = variant === "full" ? fullWidth : MARK_SIZE;

  return (
    <svg
      viewBox={`0 0 ${width.toFixed(2)} ${MARK_SIZE}`}
      role="img"
      aria-label="Sarai"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      <rect width={MARK_SIZE} height={MARK_SIZE} rx="7" className="fill-primary" />
      <g className="fill-none stroke-primary-foreground" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 25.5V15.2c0-4.6 3.2-7.3 7.5-10.2 4.3 2.9 7.5 5.6 7.5 10.2v10.3" />
        <path d="M6 25.5h20" />
      </g>
      <path
        d="M12.8 25.5v-7.6c0-2.3 1.4-3.8 3.2-5.3 1.8 1.5 3.2 3 3.2 5.3v7.6z"
        className="fill-primary-foreground"
      />
      {variant === "full" && (
        <path
          d={WORDMARK.path}
          fill="currentColor"
          transform={`translate(${MARK_SIZE + GAP} ${(MARK_SIZE - WORDMARK_HEIGHT) / 2}) scale(${wordmarkScale.toFixed(5)})`}
        />
      )}
    </svg>
  );
}

export { Logo };
