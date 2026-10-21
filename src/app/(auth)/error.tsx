"use client";

import Link from "next/link";
import { RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown when the sign-in or sign-up page fails to load. */
export default function AuthError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-gutter">
      <EmptyState
        headingLevel="h1"
        tone="error"
        title="We could not open this page"
        description="Something went wrong on our side. Your account is safe; please try again."
        action={
          <>
            <Button onClick={reset}>
              <RotateCwIcon aria-hidden />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to the home page</Link>
            </Button>
          </>
        }
      />
    </main>
  );
}
