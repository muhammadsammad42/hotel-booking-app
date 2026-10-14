import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer, Section } from "@/components/layout/page-container";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <SiteChrome>
      <Section>
        <PageContainer>
          <EmptyState
            headingLevel="h1"
            title="This page has wandered off"
            description="The address may be wrong, or the page has moved. Here is the way back."
            action={
              <>
                <Button asChild>
                  <Link href="/search">Find a stay</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Back to the home page</Link>
                </Button>
              </>
            }
          />
        </PageContainer>
      </Section>
    </SiteChrome>
  );
}
