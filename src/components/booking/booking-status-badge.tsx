import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/generated/prisma/client";

export const BOOKING_STATUSES: Record<BookingStatus, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
  PENDING: { label: "Awaiting payment", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CHECKED_IN: { label: "Checked in", variant: "primary" },
  CHECKED_OUT: { label: "Completed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  EXPIRED: { label: "Expired", variant: "outline" },
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const { label, variant } = BOOKING_STATUSES[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
