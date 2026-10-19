"use client";

import { PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Opens the print dialog; the page's print styles show only the receipt. */
export function PrintButton({ label = "Print receipt" }: { label?: string }) {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <PrinterIcon aria-hidden />
      {label}
    </Button>
  );
}
