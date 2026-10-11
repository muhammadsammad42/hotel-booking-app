import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

// Placeholder until the public browsing phase builds the real home page.
export default function Home() {
  return (
    <Section>
      <PageContainer className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="type-eyebrow text-primary">Opening soon</p>
          <h1 className="type-display-2xl mt-5">
            Stays worth <em className="font-normal">the journey.</em>
          </h1>
          <p className="type-lead mt-6 max-w-xl text-muted-foreground">
            Sarai is a collection of remarkable hotels, from overwater villas in the Maldives to a stone lodge
            above the Hunza Valley. Search and booking are on their way.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/design">
                See the design system
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-muted lg:max-h-[38rem]">
          <Image
            src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80"
            alt="Whitewashed cliffside village above the sea at dusk"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </PageContainer>
    </Section>
  );
}
