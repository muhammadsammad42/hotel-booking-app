"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setHotelActiveAction, setRoomTypeActiveAction } from "@/app/(admin)/admin/_actions/catalog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type ActiveSwitchProps = { kind: "hotel" | "room"; id: string; name: string; active: boolean };

/**
 * Live / hidden toggle. Hiding asks for confirmation first, because guests
 * lose access at once; turning it back on happens straight away. The switch
 * moves immediately and rolls back if the server refuses.
 */
export function ActiveSwitch({ kind, id, name, active }: ActiveSwitchProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = React.useOptimistic(active);
  const [confirming, setConfirming] = React.useState(false);
  const [, startTransition] = React.useTransition();

  function apply(next: boolean) {
    setConfirming(false);
    startTransition(async () => {
      setOptimistic(next);
      const result = kind === "hotel" ? await setHotelActiveAction(id, next) : await setRoomTypeActiveAction(id, next);
      if (!result.ok) {
        toast.error("Nothing changed", { description: result.formError });
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <label className="inline-flex items-center gap-2.5 text-sm">
        <Switch checked={optimistic} onCheckedChange={(next) => (next ? apply(true) : setConfirming(true))} aria-label={`${name} is ${optimistic ? "live" : "hidden"}`} />
        <span className={optimistic ? "font-medium text-success" : "text-muted-foreground"}>{optimistic ? "Live" : "Hidden"}</span>
      </label>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide {name}?</DialogTitle>
            <DialogDescription>
              {kind === "hotel"
                ? "Guests will no longer find or book this hotel. Existing bookings stay as they are, and you can turn it back on at any time."
                : "Guests will no longer be able to book this room type. Existing bookings stay as they are, and you can turn it back on at any time."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep it live</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => apply(false)}>
              Hide {kind === "hotel" ? "hotel" : "room type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
