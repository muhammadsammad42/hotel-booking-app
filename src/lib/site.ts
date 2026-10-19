/** Site-wide constants: name, description and navigation. */
export const site = {
  name: "Sarai",
  tagline: "Stays worth the journey.",
  description:
    "Sarai is a collection of remarkable hotels, from overwater villas to mountain lodges. Find your dates, compare rooms and book in minutes.",
  repoUrl: "https://github.com/muhammadsammad42/hotel-booking-app",
} as const;

export const mainNav = [
  { href: "/search", label: "Stays" },
  { href: "/destinations", label: "Destinations" },
  { href: "/account/wishlist", label: "Wishlist" },
] as const;

export const footerNav = [
  {
    title: "Explore",
    links: [
      { href: "/search", label: "All stays" },
      { href: "/destinations", label: "Destinations" },
      { href: "/account/wishlist", label: "Your wishlist" },
    ],
  },
  {
    title: "Your trips",
    links: [
      { href: "/account/trips", label: "My trips" },
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
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
