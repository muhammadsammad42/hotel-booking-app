"use client";

import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Uses the system share sheet where there is one, otherwise copies the link. */
export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closing the share sheet is not an error worth showing.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: "Share it with your travel companions." });
    } catch {
      toast.error("We could not copy the link");
    }
  }

  return (
    <Button variant="outline" size="icon" className="rounded-full" onClick={share}>
      <Share2Icon aria-hidden />
      <span className="sr-only">Share {title}</span>
    </Button>
  );
}
