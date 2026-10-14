import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AwardIcon, ClockIcon, MapPinIcon, SparklesIcon, StarIcon } from "lucide-react";

import { AmenityList } from "@/components/hotel/amenity-list";
import { BookingCard, MobileBookingBar } from "@/components/hotel/booking-card";
import { HotelBookingProvider } from "@/components/hotel/booking-context";
import { LocationMap } from "@/components/hotel/location-map";
import { PhotoGrid } from "@/components/hotel/photo-grid";
import { ReadMore } from "@/components/hotel/read-more";
import { ReviewsSection } from "@/components/hotel/reviews-section";
import { RoomCard } from "@/components/hotel/room-card";
import { ShareButton } from "@/components/hotel/share-button";
import { WishlistButton } from "@/components/hotel/wishlist-button";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { getCurrentUser } from "@/lib/auth/guards";
import { getRoomCalendars } from "@/lib/booking/data";
import { todayIso, validateStay } from "@/lib/booking/stay";
import { getHotelBySlug } from "@/lib/catalog/hotels";
import { parseSearchParams } from "@/lib/search/params";
import { getWishlistIds } from "@/lib/wishlist/queries";

export async function generateMetadata({ params }: PageProps<"/hotels/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return { title: "Hotel not found" };
  const description = hotel.description.split("\n")[0].slice(0, 160);
  return {
    title: `${hotel.name}, ${hotel.city}`,
    description,
    openGraph: { title: hotel.name, description, images: [{ url: hotel.coverImageUrl, alt: hotel.coverImageAlt }] },
  };
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="type-display-md">
      {children}
    </h2>
  );
}

export default async function HotelPage({ params, searchParams }: PageProps<"/hotels/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const hotel = await getHotelBySlug(slug);
  if (!hotel || hotel.roomTypes.length === 0) notFound();

  const parsed = parseSearchParams(query);
  // Ignore dates from the URL that break the booking rules (e.g. in the past).
  const datesValid = parsed.checkIn && parsed.checkOut && validateStay(parsed.checkIn, parsed.checkOut, todayIso()).ok;
  const stay = datesValid ? parsed : { ...parsed, checkIn: null, checkOut: null };
  const user = await getCurrentUser();
  const [savedIds, calendars] = await Promise.all([getWishlistIds(user?.id), getRoomCalendars(hotel.roomTypes)]);
  const saved = savedIds.has(hotel.id);
  const roomParam = typeof query.room === "string" ? query.room : undefined;

  const highlights = [
    hotel.guestFavourite && {
      icon: AwardIcon,
      title: "Guest favourite",
      text: "One of the highest-rated stays on Sarai, from verified guests.",
    },
    { icon: StarIcon, title: `${hotel.starRating}-star hotel`, text: `Rated ${hotel.starRating} stars for its facilities and service.` },
    {
      icon: ClockIcon,
      title: `Check-in from ${hotel.checkInTime}`,
      text: `Check-out by ${hotel.checkOutTime}. Times are local to ${hotel.city}.`,
    },
  ].filter(Boolean) as { icon: typeof StarIcon; title: string; text: string }[];

  return (
    <HotelBookingProvider
      hotelSlug={hotel.slug}
      rooms={hotel.roomTypes.map((room) => ({
        id: room.id,
        name: room.name,
        basePrice: room.basePrice,
        maxGuests: room.maxGuests,
        totalInventory: room.totalInventory,
      }))}
      calendars={calendars}
      initial={{ checkIn: stay.checkIn, checkOut: stay.checkOut, guests: stay.guests, roomId: roomParam }}
    >
      <article className="pb-28 lg:pb-0">
        <PageContainer className="pt-6 md:pt-8">
          <PhotoGrid images={hotel.images} hotelName={hotel.name} />

          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
            <div className="grid min-w-0 gap-12">
              <header className="grid gap-4 border-b pb-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="type-eyebrow flex items-center gap-1.5 text-muted-foreground">
                      <MapPinIcon className="size-3.5" aria-hidden />
                      {hotel.city}, {hotel.country}
                    </p>
                    <h1 className="type-display-xl mt-3">{hotel.name}</h1>
                  </div>
                  <div className="flex gap-2">
                    <ShareButton title={hotel.name} />
                    <WishlistButton
                      hotelId={hotel.id}
                      hotelName={hotel.name}
                      initialSaved={saved}
                      signedIn={Boolean(user)}
                      variant="outline"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {hotel.rating && (
                    <a href="#reviews" className="rounded-sm hover:underline">
                      <RatingStars value={hotel.rating.average} count={hotel.rating.count} />
                    </a>
                  )}
                  {hotel.guestFavourite && (
                    <Badge variant="brass">
                      <SparklesIcon aria-hidden />
                      Guest favourite
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">{hotel.address}</span>
                </div>
              </header>

              <section aria-label="Highlights">
                <ul className="grid gap-6 sm:grid-cols-3">
                  {highlights.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-4 sm:flex-col sm:gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span>
                        <span className="type-title-sm block">{title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="about-heading" className="grid gap-5 border-t pt-10">
                <SectionHeading id="about-heading">About this stay</SectionHeading>
                <ReadMore text={hotel.description} />
              </section>

              <section aria-labelledby="amenities-heading" className="grid gap-6 border-t pt-10">
                <SectionHeading id="amenities-heading">What this place offers</SectionHeading>
                <AmenityList amenities={hotel.amenities} hotelName={hotel.name} />
              </section>

              <section aria-labelledby="rooms-heading" className="grid gap-6 border-t pt-10">
                <SectionHeading id="rooms-heading">Rooms and suites</SectionHeading>
                <ul className="grid gap-5">
                  {hotel.roomTypes.map((room) => (
                    <li key={room.id}>
                      <RoomCard room={room} />
                    </li>
                  ))}
                </ul>
              </section>

              <section id="reviews" aria-labelledby="reviews-heading" className="grid scroll-mt-28 gap-6 border-t pt-10">
                <SectionHeading id="reviews-heading">Guest reviews</SectionHeading>
                <ReviewsSection hotel={hotel} />
              </section>

              <section aria-labelledby="location-heading" className="grid gap-5 border-t pt-10 pb-4">
                <SectionHeading id="location-heading">Where you will be</SectionHeading>
                <p className="text-muted-foreground">{hotel.address}</p>
                <LocationMap id={hotel.id} name={hotel.name} latitude={hotel.latitude} longitude={hotel.longitude} />
              </section>
            </div>

            <aside aria-label="Booking" className="lg:block">
              <div className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
                <BookingCard />
              </div>
            </aside>
          </div>
        </PageContainer>
        <MobileBookingBar />
      </article>
    </HotelBookingProvider>
  );
}
