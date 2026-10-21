"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { setStayStatusAction } from "@/app/(admin)/admin/_actions/reservations";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/generated/prisma/client";
import { safe } from "@/lib/safe-action";

/**
 * Check in or check out. The badge flips at once (optimistic) and rolls back
 * with an error toast if the server refuses.
 */
export function StayActions({
  bookingId,
  status,
  guestName,
  size = "sm",
  only,
  canCheckIn = true,
}: {
  bookingId: string;
  status: BookingStatus;
  guestName: string;
  size?: "sm" | "md";
  /** Offer just this move, e.g. check-in on the arrivals list. */
  only?: "CHECKED_IN" | "CHECKED_OUT";
  /** False before the arrival date: the server would refuse a check-in. */
  canCheckIn?: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = React.useOptimistic(status);
  const [pending, startTransition] = React.useTransition();

  function run(next: "CHECKED_IN" | "CHECKED_OUT") {
    startTransition(async () => {
      setOptimistic(next);
      const result = await safe(setStayStatusAction(bookingId, next));
      if (!result.ok) {
        toast.error("Could not update the stay", { description: result.formError });
        return;
      }
      toast.success(result.message, { description: guestName });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <BookingStatusBadge status={optimistic} />
      {optimistic === "CONFIRMED" && only !== "CHECKED_OUT" && canCheckIn && (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run("CHECKED_IN")}>
          <LogInIcon aria-hidden />
          Check in
          <span className="sr-only">{guestName}</span>
        </Button>
      )}
      {optimistic === "CHECKED_IN" && only !== "CHECKED_IN" && (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run("CHECKED_OUT")}>
          <LogOutIcon aria-hidden />
          Check out
          <span className="sr-only">{guestName}</span>
        </Button>
      )}
    </div>
  );
}
