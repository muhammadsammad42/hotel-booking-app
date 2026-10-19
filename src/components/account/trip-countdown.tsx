"use client";

import * as React from "react";

function parts(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 };
}

/**
 * Days, hours and minutes until check-in. The first render uses the server's
 * clock so the HTML matches; it then ticks every 15 seconds.
 */
export function TripCountdown({ target, serverNow }: { target: string; serverNow: string }) {
  const end = React.useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = React.useState(() => new Date(serverNow).getTime());

  React.useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  const { days, hours, minutes } = parts(end - now);
  const units = [
    { value: days, label: days === 1 ? "day" : "days" },
    { value: hours, label: hours === 1 ? "hour" : "hours" },
    { value: minutes, label: minutes === 1 ? "minute" : "minutes" },
  ];

  return (
    <div role="timer" aria-label={`${days} days, ${hours} hours and ${minutes} minutes until check-in`} className="flex gap-2">
      {units.map((unit) => (
        <div key={unit.label} className="grid min-w-16 justify-items-center rounded-xl bg-lightbox/45 px-3 py-2 text-lightbox-foreground backdrop-blur-md" aria-hidden>
          <span className="text-2xl font-semibold tabular-nums sm:text-3xl">{String(unit.value).padStart(2, "0")}</span>
          <span className="text-xs text-lightbox-foreground/80">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
