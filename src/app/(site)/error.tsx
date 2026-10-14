"use client";

import Link from "next/link";
import { RotateCwIcon } from "lucide-react";

import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown when a page fails to load. The header and footer stay in place. */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Section>
      <PageContainer>
        <EmptyState
          headingLevel="h1"
          tone="error"
          title="Something went wrong on our side"
          description="The page could not load just now. Nothing you did caused this. Please try again."
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
      </PageContainer>
    </Section>
  );
}
