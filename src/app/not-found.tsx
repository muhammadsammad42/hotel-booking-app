import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Section>
      <PageContainer>
        <EmptyState
          headingLevel="h1"
          title="This page has wandered off"
          description="The address may be wrong, or the page is not built yet. The way back is just below."
          action={
            <Button asChild>
              <Link href="/">Back to the home page</Link>
            </Button>
          }
        />
      </PageContainer>
    </Section>
  );
}
