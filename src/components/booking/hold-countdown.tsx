"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TimerIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function remaining(expiresAt: number) {
  return Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
}

/**
 * "We are holding your room for 28:41". Turns amber in the last five minutes
 * and refreshes the page when the hold ends, so the expired message shows.
 * Screen readers hear the time once a minute, not every second.
 */
export function HoldCountdown({ expiresAt, className }: { expiresAt: string; className?: string }) {
  const router = useRouter();
  const end = React.useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [seconds, setSeconds] = React.useState<number | null>(null);

  React.useEffect(() => {
    const tick = () => {
      const left = remaining(end);
      setSeconds(left);
      if (left === 0) {
        window.clearInterval(timer);
        router.refresh();
      }
    };
    const timer = window.setInterval(tick, 1000);
    const first = window.setTimeout(tick, 0);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(first);
    };
  }, [end, router]);

  if (seconds === null) return <div className={cn("h-14 rounded-xl bg-muted", className)} aria-hidden />;

  const minutes = Math.floor(seconds / 60);
  const clock = `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  const urgent = seconds <= 5 * 60;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors duration-200 ease-soft",
        urgent ? "border-warning/40 bg-warning/10 text-warning" : "border-border bg-muted/50 text-foreground",
        className,
      )}
    >
      <TimerIcon className="size-5 shrink-0" aria-hidden />
      <p>
        We are holding your room for <span className="font-semibold tabular-nums">{clock}</span>.{" "}
        {urgent ? "Complete payment soon to keep it." : "Take your time; nothing is charged until you pay."}
      </p>
      <span className="sr-only" aria-live="polite">
        {minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"} left on your hold` : "Less than a minute left"}
      </span>
    </div>
  );
}
