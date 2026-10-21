"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { cancelBookingAction } from "@/app/(site)/account/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { safe } from "@/lib/safe-action";

type CancelBookingDialogProps = {
  bookingId: string;
  hotelName: string;
  refund: string;
  deadline: string;
};

/** Confirms before cancelling: says what will be refunded, and that it cannot be undone. */
export function CancelBookingDialog({ bookingId, hotelName, refund, deadline }: CancelBookingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      const result = await safe(cancelBookingAction(bookingId));
      if (!result.ok) {
        setError(result.formError);
        return;
      }
      setOpen(false);
      toast.success("Your booking is cancelled", { description: result.message });
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:border-destructive hover:text-destructive">
          <XCircleIcon aria-hidden />
          Cancel booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel your stay at {hotelName}?</DialogTitle>
          <DialogDescription>
            You will get a full refund of <strong className="font-semibold text-foreground">{refund}</strong> to the card you paid with. Refunds
            usually arrive in 5 to 10 working days. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">Free cancellation is open until {deadline}.</p>
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Keep my booking
            </Button>
          </DialogClose>
          <Button variant="destructive" loading={pending} onClick={confirm}>
            Cancel and refund {refund}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
