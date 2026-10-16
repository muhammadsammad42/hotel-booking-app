"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Copies a value, e.g. a booking reference, and confirms with a tick. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied", { description: value });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("We could not copy that", { description: "Select it and copy it by hand." });
    }
  }

  return (
    <Button variant="outline" size="icon-sm" onClick={copy}>
      {copied ? <CheckIcon className="text-success" aria-hidden /> : <CopyIcon aria-hidden />}
      <span className="sr-only">{copied ? "Copied" : label}</span>
    </Button>
  );
}
