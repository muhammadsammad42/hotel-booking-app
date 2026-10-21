"use client";

import { RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border bg-card">
      <EmptyState
        headingLevel="h1"
        tone="error"
        title="This page did not load"
        description={`Something went wrong on our side. Your data is safe; try again in a moment.${error.digest ? ` (Reference ${error.digest})` : ""}`}
        action={
          <Button onClick={reset}>
            <RotateCwIcon aria-hidden />
            Try again
          </Button>
        }
      />
    </div>
  );
}
