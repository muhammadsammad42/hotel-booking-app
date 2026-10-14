import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon, GemIcon, QuoteIcon, ReceiptTextIcon, ShieldCheckIcon } from "lucide-react";

import { DestinationCard } from "@/components/home/destination-card";
import { TrendingCarousel } from "@/components/home/trending-carousel";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { SearchForm } from "@/components/search/search-form";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { getCurrentUser } from "@/lib/auth/guards";
import { getDestinationSuggestions, getDestinations, getTestimonials, getTrendingHotels } from "@/lib/catalog/hotels";
import { getWishlistIds } from "@/lib/wishlist/queries";

const reasons = [
  {
    icon: GemIcon,
    title: "Hand-picked hotels",
    text: "Every stay is chosen for its setting and its welcome, from Hunza to the Maldives.",
  },
  {
    icon: ReceiptTextIcon,
    title: "Prices you can trust",
    text: "See the nightly rate, taxes and fees before you pay. No surprises at checkout.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Reviews from real stays",
    text: "Only guests who have stayed can leave a review, so every rating is earned.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure payment",
    text: "Pay with Stripe. Your room is held for you while you complete the booking.",
  },
];

const reviewDate = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export default async function Home() {
  const user = await getCurrentUser();
  const [suggestions, trending, destinations, testimonials, savedIds] = await Promise.all([
    getDestinationSuggestions(),
    getTrendingHotels(),
    getDestinations(),
    getTestimonials(3),
    getWishlistIds(user?.id),
  ]);

  return (
    <>
      <section aria-labelledby="hero-heading" className="relative">
        <div className="relative isolate h-[min(64vh,34rem)] overflow-hidden bg-muted md:h-[min(78vh,44rem)]">
          <Image
            src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=80"
            alt="Overwater villas on stilts in a clear turquoise lagoon"
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          {/* Darkens the side the headline sits on, so it reads on any photo. */}
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-lightbox/75 via-lightbox/35 to-lightbox/0" aria-hidden />
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-lightbox/30 via-transparent to-lightbox/40" aria-hidden />
          <PageContainer className="flex h-full flex-col justify-center pb-20 text-lightbox-foreground md:pb-28">
            <p className="type-eyebrow text-lightbox-foreground/85">Nine remarkable places to stay</p>
            <h1 id="hero-heading" className="type-display-2xl mt-4 max-w-3xl">
              Stays worth <em className="font-normal">the journey.</em>
            </h1>
            <p className="type-lead mt-5 max-w-xl text-lightbox-foreground/90">
              From overwater villas to a stone lodge above the Hunza Valley. Find your dates and book in minutes.
            </p>
          </PageContainer>
        </div>
        <PageContainer className="relative -mt-16 md:-mt-20">
          <SearchForm suggestions={suggestions} />
        </PageContainer>
      </section>

      <Section aria-labelledby="trending-heading">
        <PageContainer>
          <Reveal>
            <p className="type-eyebrow text-primary">Trending now</p>
            <h2 id="trending-heading" className="type-display-lg mt-3 mb-8 max-w-xl">
              Where guests are booking this season
            </h2>
          </Reveal>
          <TrendingCarousel
            hotels={trending}
            savedIds={[...savedIds]}
            signedIn={Boolean(user)}
            labelledBy="trending-heading"
          />
        </PageContainer>
      </Section>

      <Section aria-labelledby="destinations-heading" className="bg-muted/50">
        <PageContainer>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="type-eyebrow text-primary">Destinations</p>
              <h2 id="destinations-heading" className="type-display-lg mt-3 max-w-xl">
                Beach, city, mountain and desert
              </h2>
            </div>
            <Button asChild variant="link">
              <Link href="/destinations">
                All destinations
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </Reveal>
          <ul className="mt-8 grid auto-rows-[16rem] gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[15rem]">
            {destinations.slice(0, 6).map((destination, index) => (
              <li key={destination.name} className={index === 0 ? "sm:col-span-2 lg:row-span-2" : undefined}>
                <Reveal delay={Math.min(index, 4) * 0.06} className="h-full">
                  <DestinationCard destination={destination} large={index === 0} className="h-full" />
                </Reveal>
              </li>
            ))}
          </ul>
        </PageContainer>
      </Section>

      <Section aria-labelledby="why-heading">
        <PageContainer>
          <Reveal className="max-w-2xl">
            <p className="type-eyebrow text-primary">Why Sarai</p>
            <h2 id="why-heading" className="type-display-lg mt-3">
              The old idea of a warm welcome, booked the modern way
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <Reveal delay={index * 0.06}>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="type-title-md mt-5">{title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </PageContainer>
      </Section>

      {testimonials.length > 0 && (
        <Section aria-labelledby="reviews-heading" className="border-y bg-card">
          <PageContainer>
            <Reveal className="max-w-2xl">
              <p className="type-eyebrow text-primary">From our guests</p>
              <h2 id="reviews-heading" className="type-display-lg mt-3">
                Five stars, in their own words
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((review, index) => (
                <li key={review.id}>
                  <Reveal delay={index * 0.08} className="h-full">
                    <figure className="flex h-full flex-col rounded-2xl border bg-background p-6 sm:p-7">
                      <QuoteIcon className="size-7 text-brass" aria-hidden />
                      <blockquote className="type-display-sm mt-4 flex-1 font-normal text-pretty">
                        {review.comment}
                      </blockquote>
                      <figcaption className="mt-6 flex items-end justify-between gap-3 border-t pt-4">
                        <span>
                          <span className="block font-semibold">{review.user.name}</span>
                          <Link
                            href={`/hotels/${review.hotel.slug}`}
                            className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                          >
                            {review.hotel.name}
                          </Link>
                          <span className="block text-xs text-muted-foreground">{reviewDate.format(review.createdAt)}</span>
                        </span>
                        <RatingStars value={review.rating} showValue={false} size="sm" />
                      </figcaption>
                    </figure>
                  </Reveal>
                </li>
              ))}
            </ul>
          </PageContainer>
        </Section>
      )}

      <Section aria-labelledby="cta-heading">
        <PageContainer>
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl bg-muted px-6 py-16 text-center text-lightbox-foreground sm:px-12 md:py-24">
              <Image
                src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1600&q=80"
                alt=""
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="-z-10 object-cover"
              />
              <div className="absolute inset-0 -z-10 bg-lightbox/55" aria-hidden />
              <p className="type-eyebrow text-lightbox-foreground/85">Your next stay</p>
              <h2 id="cta-heading" className="type-display-xl mx-auto mt-4 max-w-2xl">
                The road is long. The welcome is worth it.
              </h2>
              <Button asChild size="lg" className="mt-9">
                <Link href="/search">
                  Find your stay
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
            </div>
          </Reveal>
        </PageContainer>
      </Section>
    </>
  );
}
