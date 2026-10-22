import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import type { HotelDetail } from "@/lib/catalog/hotels";
import { initials } from "@/lib/format";

const reviewDate = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

function Bar({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="contents">
        <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span className="block h-full rounded-full bg-primary" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
        </span>
        <span className="text-right font-medium tabular-nums">{display}</span>
      </dd>
    </div>
  );
}

/** Score, breakdown bars, sub-ratings and the reviews themselves. */
export function ReviewsSection({ hotel }: { hotel: HotelDetail }) {
  if (!hotel.rating) {
    return (
      <p className="text-muted-foreground">
        No reviews yet. Reviews come only from guests who have stayed, so this hotel is waiting for its first.
      </p>
    );
  }

  const subRatings = [
    { label: "Cleanliness", value: hotel.subRatings.cleanliness },
    { label: "Location", value: hotel.subRatings.location },
    { label: "Value", value: hotel.subRatings.value },
    { label: "Service", value: hotel.subRatings.service },
  ];

  return (
    <div className="grid gap-10">
      <div className="grid gap-8 rounded-2xl border bg-card p-6 sm:p-8 md:grid-cols-[auto_1fr_1fr] md:gap-10">
        <div>
          <p className="type-display-xl tabular-nums">{hotel.rating.average.toFixed(1)}</p>
          <RatingStars value={hotel.rating.average} showValue={false} size="md" className="mt-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            {hotel.rating.count} {hotel.rating.count === 1 ? "review" : "reviews"} from verified stays
          </p>
        </div>
        <dl className="grid content-center gap-2.5" aria-label="Rating breakdown">
          {hotel.distribution.map((row) => (
            <Bar
              key={row.stars}
              label={`${row.stars} ${row.stars === 1 ? "star" : "stars"}`}
              value={row.count}
              max={hotel.rating!.count}
              display={String(row.count)}
            />
          ))}
        </dl>
        <dl className="grid content-center gap-2.5" aria-label="Ratings by category">
          {subRatings.map((row) => (
            <Bar key={row.label} label={row.label} value={row.value} max={5} display={row.value.toFixed(1)} />
          ))}
        </dl>
      </div>

      <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {hotel.reviews.map((review) => (
          <li key={review.id}>
            <article className="grid gap-3">
              <header className="flex items-center gap-3">
                <Avatar>
                  {review.user.image && <AvatarImage src={review.user.image} alt="" />}
                  <AvatarFallback className="bg-primary/15 font-semibold text-foreground">
                    {initials(review.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{review.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={review.createdAt.toISOString()}>{reviewDate.format(review.createdAt)}</time>
                  </p>
                </div>
              </header>
              <RatingStars value={review.rating} showValue={false} size="sm" />
              {review.comment && <p className="leading-relaxed text-foreground/90">{review.comment}</p>}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
