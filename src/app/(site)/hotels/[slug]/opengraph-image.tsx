import { ImageResponse } from "next/og";

import { getHotelBySlug } from "@/lib/catalog/hotels";
import { formatPrice } from "@/lib/format";
import { loadOgFonts, OG_SIZE, ogColors, OgMark, ogPhoto, OgStar } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A hotel on Sarai";

/** The share card for a hotel: its photo, name, place, rating and price. */
export default async function HotelOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  const name = hotel?.name ?? "Sarai";
  const fromPrice = hotel?.roomTypes.length ? Math.min(...hotel.roomTypes.map((room) => room.basePrice)) : null;

  const place = hotel ? `${hotel.city}, ${hotel.country}`.toUpperCase() : "";
  const rating = hotel?.rating ? `${hotel.rating.average.toFixed(1)} · ${hotel.rating.count} reviews` : "";
  const stars = hotel ? `${hotel.starRating}-star hotel` : "";
  const price = fromPrice !== null ? `From ${formatPrice(fromPrice)} a night` : "";
  const fonts = await loadOgFonts(`${name}Sarai`, `${place}${rating}${stars}${price}·`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: ogColors.night,
          color: ogColors.cream,
          fontFamily: "Instrument Sans",
        }}
      >
        {hotel && (
          // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>.
          <img src={ogPhoto(hotel.coverImageUrl)} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} />
        )}
        {/* Scrims so the text reads on any photo. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(90deg, rgba(15,12,10,0.86) 0%, rgba(15,12,10,0.6) 50%, rgba(15,12,10,0.15) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(180deg, rgba(15,12,10,0) 40%, rgba(15,12,10,0.7) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "56px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <OgMark size={52} />
            <span style={{ fontSize: 40, fontFamily: "Fraunces" }}>Sarai</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {place && <span style={{ fontSize: 24, letterSpacing: 4, opacity: 0.9 }}>{place}</span>}
            <span style={{ fontSize: 78, lineHeight: 1.04, fontFamily: "Fraunces", maxWidth: 920 }}>{name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 28 }}>
              {rating && (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <OgStar />
                  {rating}
                </span>
              )}
              {stars && <span>{stars}</span>}
              {price && <span>{price}</span>}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
