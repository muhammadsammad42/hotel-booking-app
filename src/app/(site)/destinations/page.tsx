import type { Metadata } from "next";

import { DestinationCard } from "@/components/home/destination-card";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { getDestinations } from "@/lib/catalog/hotels";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Beach, city, mountain and desert: every place you can stay with Sarai.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <Section>
      <PageContainer>
        <header className="max-w-2xl">
          <p className="type-eyebrow text-primary">Destinations</p>
          <h1 className="type-display-xl mt-4">Where will the road take you?</h1>
          <p className="type-lead mt-4 text-muted-foreground">
            {destinations.length} places, from lagoons and caldera cliffs to the Karakoram and the dunes of Dubai.
          </p>
        </header>
        <ul className="mt-12 grid auto-rows-[18rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <li key={destination.name}>
              <Reveal delay={Math.min(index % 3, 2) * 0.06} className="h-full">
                <DestinationCard destination={destination} className="h-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </PageContainer>
    </Section>
  );
}
