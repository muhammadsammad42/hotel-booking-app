/** Site-wide constants: name, description and navigation. */
export const site = {
  name: "Sarai",
  tagline: "Stays worth the journey.",
  description:
    "Sarai is a collection of remarkable hotels, from overwater villas to mountain lodges. Find your dates, compare rooms and book in minutes.",
  repoUrl: "https://github.com/muhammadsammad42/hotel-booking-app",
} as const;

export const mainNav = [
  { href: "/hotels", label: "Stays" },
  { href: "/destinations", label: "Destinations" },
  { href: "/wishlist", label: "Wishlist" },
] as const;

export const footerNav = [
  {
    title: "Explore",
    links: [
      { href: "/hotels", label: "All stays" },
      { href: "/destinations", label: "Destinations" },
      { href: "/wishlist", label: "Your wishlist" },
    ],
  },
  {
    title: "Your trips",
    links: [
      { href: "/account/bookings", label: "My bookings" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create an account" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/design", label: "Design system" },
      { href: site.repoUrl, label: "Source on GitHub" },
    ],
  },
] as const;
