import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  HeartIcon,
  MapPinIcon,
  RotateCwIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { DateRangeDemo, LoadingButtonDemo, OverlayDemo, ToastDemo } from "@/components/design/demos";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { ImageGallery } from "@/components/ui/image-gallery";
import { Input } from "@/components/ui/input";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HotelCardSkeleton, SkeletonText } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Design system",
  description: "Every colour, type style and component in the Sarai design system.",
  robots: { index: false },
};

const sections = [
  { id: "brand", title: "Brand" },
  { id: "colour", title: "Colour" },
  { id: "type", title: "Typography" },
  { id: "registers", title: "Editorial and app" },
  { id: "tokens", title: "Radius, shadow, spacing" },
  { id: "buttons", title: "Buttons" },
  { id: "forms", title: "Form controls" },
  { id: "dates", title: "Date range picker" },
  { id: "data", title: "Badges, ratings, prices" },
  { id: "cards", title: "Cards and skeletons" },
  { id: "navigation", title: "Tabs and stepper" },
  { id: "overlays", title: "Overlays and toasts" },
  { id: "gallery", title: "Image gallery" },
  { id: "states", title: "Empty and error states" },
  { id: "motion", title: "Motion" },
] as const;

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const galleryImages = [
  { url: photo("1570077188670-e3a8d69ac5ff"), alt: "Whitewashed cliffside village above the sea at dusk" },
  { url: photo("1613395877344-13d4a8e0d49e"), alt: "Blue-domed churches overlooking the sea in bright sunlight" },
  { url: photo("1586611292717-f828b167408c"), alt: "Infinity pool terrace with sun loungers facing the open sea" },
  { url: photo("1533105079780-92b9be482077"), alt: "Narrow whitewashed lane with flowers opening onto a deep blue bay" },
  { url: photo("1559339352-11d035aa65de"), alt: "Seaside terrace restaurant with tables set under a canopy" },
];

const colours = [
  { name: "background", className: "bg-background", light: "#FAF6EF", dark: "#171311", use: "Page background (ivory / espresso)" },
  { name: "card", className: "bg-card", light: "#FFFCF7", dark: "#211B17", use: "Cards, inputs, raised surfaces" },
  { name: "muted", className: "bg-muted", light: "#EFE6D8", dark: "#2A231E", use: "Sand: quiet fills, skeletons" },
  { name: "foreground", className: "bg-foreground", light: "#1F1A17", dark: "#F3ECE2", use: "Ink: text and icons" },
  { name: "muted-foreground", className: "bg-muted-foreground", light: "#665A50", dark: "#B5A898", use: "Secondary text" },
  { name: "primary", className: "bg-primary", light: "#B4532A", dark: "#D97B4F", use: "Terracotta: primary actions, links" },
  { name: "secondary", className: "bg-secondary", light: "#3F4A3C", dark: "#4A5746", use: "Olive: secondary actions" },
  { name: "brass", className: "bg-brass", light: "#C29A5B", dark: "#D2AE74", use: "Accent: featured badges, small details" },
  { name: "success", className: "bg-success", light: "#356348", dark: "#82B594", use: "Confirmed, available" },
  { name: "warning", className: "bg-warning", light: "#8F5A0C", dark: "#DBA74A", use: "Pending, few rooms left" },
  { name: "destructive", className: "bg-destructive", light: "#A8322D", dark: "#E5766B", use: "Errors, cancel, delete" },
  { name: "border", className: "bg-border", light: "#E2D6C4", dark: "#3A302A", use: "Hairlines and dividers" },
  { name: "input", className: "bg-input", light: "#96846F", dark: "#7D6F62", use: "Form control borders (3:1 contrast)" },
] as const;

const displayStyles = [
  { className: "type-display-2xl", label: "Display 2XL", sample: "Stays worth the journey", use: "Home hero only" },
  { className: "type-display-xl", label: "Display XL", sample: "A lodge above the valley", use: "Page titles on editorial pages" },
  { className: "type-display-lg", label: "Display LG", sample: "Rooms and suites", use: "Section headings" },
  { className: "type-display-md", label: "Display MD", sample: "Caldera View Suite", use: "Hotel and room names in lists" },
  { className: "type-display-sm", label: "Display SM", sample: "Baltit Heights Lodge", use: "Card titles" },
] as const;

const appStyles = [
  { className: "type-title-lg", label: "Title LG", sample: "Review your booking", use: "Page titles in booking, account, admin" },
  { className: "type-title-md", label: "Title MD", sample: "Guest details", use: "Card and panel headings" },
  { className: "type-title-sm", label: "Title SM", sample: "Price summary", use: "Small headings, table headers" },
  { className: "type-lead", label: "Lead", sample: "A family-run stone and timber lodge above Karimabad.", use: "Intro paragraph under a heading" },
  { className: "text-base", label: "Body", sample: "Check-in from 3 pm. Breakfast is served on the terrace.", use: "Default text" },
  { className: "text-sm text-muted-foreground", label: "Small", sample: "Free cancellation until 30 October", use: "Supporting details" },
  { className: "type-eyebrow text-primary", label: "Eyebrow", sample: "Hunza, Pakistan", use: "Labels above headings" },
] as const;

function ThemePreview({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} className={cn(theme, "min-w-0 rounded-xl border bg-background p-5 text-foreground sm:p-6")}>
          <p className="type-eyebrow mb-5 text-muted-foreground">{theme}</p>
          <div className={className}>{children}</div>
        </div>
      ))}
    </div>
  );
}

function DesignSection({
  id,
  title,
  description,
  children,
}: {
  id: (typeof sections)[number]["id"];
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0">
      <h2 id={`${id}-heading`} className="type-display-lg">
        {title}
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground">{description}</p>
      <div className="mt-8 grid gap-8">{children}</div>
    </section>
  );
}

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-3">
      <h3 className="type-title-sm">{title}</h3>
      {children}
    </div>
  );
}

function FormExamples() {
  return (
    <div className="grid gap-5">
      <Field label="Full name" required>
        <Input placeholder="Ayesha Khan" autoComplete="name" />
      </Field>
      <Field label="Email" hint="We send your booking confirmation here.">
        <Input type="email" placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Phone" error="Enter a phone number with its country code.">
        <Input type="tel" defaultValue="0300 555" />
      </Field>
      <Field label="Guests">
        <Select defaultValue="2">
          <SelectTrigger>
            <SelectValue placeholder="Select guests" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Adults</SelectLabel>
              <SelectItem value="1">1 guest</SelectItem>
              <SelectItem value="2">2 guests</SelectItem>
              <SelectItem value="3">3 guests</SelectItem>
              <SelectItem value="4">4 guests</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Special requests" hint="Optional. The hotel will do its best.">
        <Textarea placeholder="A quiet room, an early check-in..." />
      </Field>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <Checkbox defaultChecked />
        Email me a reminder before my trip
      </label>
      <Field label="Promo code" hint="Disabled until dates are chosen.">
        <Input disabled placeholder="SUMMER" />
      </Field>
    </div>
  );
}

export default function DesignPage() {
  return (
    <Section spacing="compact">
      <PageContainer>
        <header className="max-w-3xl pb-10">
          <p className="type-eyebrow text-primary">Design system</p>
          <h1 className="type-display-xl mt-4">The Sarai look, in one place</h1>
          <p className="type-lead mt-4 text-muted-foreground">
            Every colour, type style and component used in the app. Use the sun and moon button in the header
            to switch theme; most examples also show both themes side by side.
          </p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Sections" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <ul className="-mx-gutter flex gap-1 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:grid lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
              {sections.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-11 items-center rounded-md px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 ease-soft hover:bg-accent hover:text-foreground lg:min-h-9"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <DesignSection
              id="brand"
              title="Brand"
              description="A sarai was an inn on the old trade routes. The mark is its gate: a pointed archway. The mood is a printed travel magazine: warm paper, ink, terracotta and unhurried photography."
            >
              <ThemePreview className="flex flex-wrap items-center gap-8">
                <Logo className="h-10" />
                <Logo variant="mark" className="h-10" />
                <Logo variant="mark" className="h-6" />
              </ThemePreview>
              <ul className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Photography first", "Type and colour stay quiet so the place does the talking."],
                  ["Warm, not loud", "Paper tones and hairlines. Terracotta is saved for actions."],
                  ["Never in the way", "Booking is fast and plain. Decoration stops at the checkout."],
                ].map(([title, text]) => (
                  <li key={title} className="rounded-xl border bg-card p-5">
                    <p className="type-title-sm">{title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </li>
                ))}
              </ul>
            </DesignSection>

            <DesignSection
              id="colour"
              title="Colour"
              description="Colours are theme tokens, used through Tailwind classes such as bg-primary and text-muted-foreground. Never write a hex value in a component."
            >
              <div className="grid gap-4 xl:grid-cols-2">
                {(["light", "dark"] as const).map((theme) => (
                  <div key={theme} className={cn(theme, "rounded-xl border bg-background p-5 text-foreground sm:p-6")}>
                    <p className="type-eyebrow mb-5 text-muted-foreground">{theme}</p>
                    <ul className="grid gap-3">
                      {colours.map((colour) => (
                        <li key={colour.name} className="flex items-center gap-4">
                          <span className={cn("size-11 shrink-0 rounded-lg border", colour.className)} aria-hidden />
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-sm font-semibold">{colour.name}</span>
                              <span className="font-mono text-xs text-muted-foreground">{colour[theme]}</span>
                            </span>
                            <span className="block text-sm text-muted-foreground">{colour.use}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DesignSection>

            <DesignSection
              id="type"
              title="Typography"
              description="Fraunces, a soft serif, carries editorial headlines. Instrument Sans does everything else: interface, forms, body text and numbers."
            >
              <Example title="Display: Fraunces (editorial pages)">
                <ul className="divide-y rounded-xl border bg-card">
                  {displayStyles.map((style) => (
                    <li key={style.label} className="grid gap-2 p-5">
                      <p className={style.className}>{style.sample}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{style.className}</span> · {style.use}
                      </p>
                    </li>
                  ))}
                </ul>
              </Example>
              <Example title="Titles and text: Instrument Sans (everywhere, and all app screens)">
                <ul className="divide-y rounded-xl border bg-card">
                  {appStyles.map((style) => (
                    <li key={style.label} className="grid gap-2 p-5">
                      <p className={style.className}>{style.sample}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{style.className}</span> · {style.use}
                      </p>
                    </li>
                  ))}
                </ul>
              </Example>
            </DesignSection>

            <DesignSection
              id="registers"
              title="Editorial and app"
              description="The system has two registers. Editorial is for the home page, search results and hotel pages. App is for the booking flow, account and admin: sans type, tighter spacing and one clear call to action."
            >
              <div className="grid items-start gap-4 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-8 sm:p-10">
                  <p className="type-eyebrow text-primary">Editorial</p>
                  <h3 className="type-display-lg mt-4">
                    Wake up to <em>Rakaposhi</em>
                  </h3>
                  <p className="type-lead mt-4 text-muted-foreground">
                    Apricot orchards, a fire in the evening and the Karakoram outside your window.
                  </p>
                  <Button asChild variant="link" className="mt-6">
                    <Link href="#registers">
                      Read about the lodge
                      <ArrowRightIcon aria-hidden />
                    </Link>
                  </Button>
                </div>
                <div className="rounded-xl border bg-card p-5">
                  <p className="type-eyebrow text-muted-foreground">App</p>
                  <h3 className="type-title-md mt-3">Your stay</h3>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Valley View Deluxe</dt>
                      <dd className="tabular-nums">5 nights</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">20 to 25 October</dt>
                      <dd className="tabular-nums">3 guests</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 border-t pt-3">
                      <dt className="font-semibold">Total</dt>
                      <dd>
                        <PriceTag amount={56700} unit={null} />
                      </dd>
                    </div>
                  </dl>
                  <Button size="lg" fullWidth className="mt-5">
                    Continue to payment
                  </Button>
                </div>
              </div>
            </DesignSection>

            <DesignSection
              id="tokens"
              title="Radius, shadow, spacing"
              description="Corners are small and quiet. Hairline borders separate surfaces; shadows are warm and reserved for hover, overlays and the primary button."
            >
              <Example title="Radius">
                <ul className="flex flex-wrap gap-4">
                  {[
                    ["rounded-sm", "4px"],
                    ["rounded-md", "6px"],
                    ["rounded-lg", "8px"],
                    ["rounded-xl", "10px"],
                    ["rounded-2xl", "14px"],
                    ["rounded-full", "pill"],
                  ].map(([className, size]) => (
                    <li key={className} className="grid justify-items-center gap-2">
                      <span className={cn("size-16 border border-input bg-card", className)} aria-hidden />
                      <span className="font-mono text-xs text-muted-foreground">
                        {className.replace("rounded-", "")} · {size}
                      </span>
                    </li>
                  ))}
                </ul>
              </Example>
              <Example title="Shadow">
                <ul className="flex flex-wrap gap-6 rounded-xl bg-muted/60 p-6">
                  {[
                    ["shadow-xs", "Hairline lift"],
                    ["shadow-lift", "Card hover"],
                    ["shadow-overlay", "Menus, dialogs"],
                    ["shadow-cta", "Primary button"],
                  ].map(([className, use]) => (
                    <li key={className} className="grid justify-items-center gap-3">
                      <span className={cn("h-16 w-24 rounded-xl bg-card", className)} aria-hidden />
                      <span className="text-center text-xs text-muted-foreground">
                        <span className="block font-mono">{className}</span>
                        {use}
                      </span>
                    </li>
                  ))}
                </ul>
              </Example>
              <Example title="Spacing and widths">
                <ul className="grid gap-2 text-sm">
                  {[
                    ["px-gutter", "Side padding of every page, 16 to 40px"],
                    ["py-section", "Editorial section rhythm, 64 to 120px"],
                    ["py-section-compact", "App section rhythm, 32 to 48px"],
                    ["max-w-page", "1280px: editorial pages"],
                    ["max-w-app", "1024px: booking, account, admin"],
                    ["max-w-prose", "672px: long text"],
                  ].map(([token, use]) => (
                    <li key={token} className="flex flex-wrap gap-x-3">
                      <span className="font-mono text-xs leading-6 text-primary">{token}</span>
                      <span className="text-muted-foreground">{use}</span>
                    </li>
                  ))}
                </ul>
              </Example>
            </DesignSection>

            <DesignSection
              id="buttons"
              title="Buttons"
              description="One primary button per view, for the action that moves the booking forward. It is solid terracotta with a shadow so it is never missed. Everything else is quieter."
            >
              <Example title="Variants">
                <ThemePreview className="flex flex-wrap items-center gap-3">
                  <Button>Reserve</Button>
                  <Button variant="secondary">Check availability</Button>
                  <Button variant="outline">View rooms</Button>
                  <Button variant="ghost">Skip</Button>
                  <Button variant="destructive">Cancel booking</Button>
                  <Button variant="link">See all 45 reviews</Button>
                </ThemePreview>
              </Example>
              <Example title="Sizes">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg">Large · booking actions</Button>
                  <Button>Medium · default</Button>
                  <Button size="sm">Small · dense screens</Button>
                  <Button size="icon" variant="outline">
                    <HeartIcon className="size-5" aria-hidden />
                    <span className="sr-only">Save to wishlist</span>
                  </Button>
                  <Button size="icon-sm" variant="outline">
                    <RotateCwIcon aria-hidden />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Small and small-icon buttons grow to 44px on touch screens.
                </p>
              </Example>
              <Example title="With icon, loading, disabled, full width">
                <div className="flex flex-wrap items-center gap-3">
                  <Button>
                    <SearchIcon aria-hidden />
                    Search stays
                  </Button>
                  <LoadingButtonDemo />
                  <Button loading>Paying</Button>
                  <Button disabled>Sold out</Button>
                </div>
                <div className="max-w-sm">
                  <Button size="lg" fullWidth>
                    Confirm and pay $1,680
                  </Button>
                </div>
              </Example>
            </DesignSection>

            <DesignSection
              id="forms"
              title="Form controls"
              description="Controls are 44px tall with a visible border. Field wires up the label, hint and error so screen readers announce them. The Select menu opens in the page theme."
            >
              <ThemePreview className="max-w-md">
                <FormExamples />
              </ThemePreview>
            </DesignSection>

            <DesignSection
              id="dates"
              title="Date range picker"
              description="Two months in a popover on desktop; one month in a bottom sheet on mobile. Day cells are 44px on touch screens, and arrow keys move between days."
            >
              <DateRangeDemo />
            </DesignSection>

            <DesignSection
              id="data"
              title="Badges, ratings, prices"
              description="Small pieces that appear on every hotel card and booking."
            >
              <Example title="Badge">
                <ThemePreview className="flex flex-wrap items-center gap-2">
                  <Badge>Free cancellation</Badge>
                  <Badge variant="primary">New</Badge>
                  <Badge variant="brass">
                    <SparklesIcon aria-hidden />
                    Featured
                  </Badge>
                  <Badge variant="outline">Beach</Badge>
                  <Badge variant="success">
                    <CalendarCheckIcon aria-hidden />
                    Confirmed
                  </Badge>
                  <Badge variant="warning">Awaiting payment</Badge>
                  <Badge variant="destructive">Cancelled</Badge>
                </ThemePreview>
              </Example>
              <Example title="RatingStars">
                <ThemePreview className="grid gap-3">
                  <RatingStars value={4.8} count={128} size="lg" />
                  <RatingStars value={4.4} count={45} />
                  <RatingStars value={3.5} size="sm" />
                  <RatingStars value={5} showValue={false} />
                </ThemePreview>
              </Example>
              <Example title="PriceTag">
                <ThemePreview className="grid gap-3">
                  <PriceTag amount={98000} size="lg" />
                  <PriceTag amount={42000} prefix="From" />
                  <PriceTag amount={50400} originalAmount={56000} />
                  <PriceTag amount={168000} unit={null} size="sm" />
                </ThemePreview>
              </Example>
              <Example title="Avatar">
                <ThemePreview className="flex items-center gap-4">
                  <Avatar size="lg">
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>DM</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>SR</AvatarFallback>
                  </Avatar>
                </ThemePreview>
              </Example>
            </DesignSection>

            <DesignSection
              id="cards"
              title="Cards and skeletons"
              description="Cards are bordered surfaces. An interactive card lifts on hover and shows a ring when its link has keyboard focus. Skeletons copy the shape of what is loading."
            >
              <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <Card interactive>
                  <div className="relative aspect-4/5 overflow-hidden bg-muted">
                    <Image
                      src={photo("1596394516093-501ba68a0ba6")}
                      alt="Bed and bistro table on a timber deck high above a mountain lake"
                      fill
                      sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-soft group-hover/card:scale-[1.03]"
                    />
                    <Badge variant="brass" className="absolute top-3 left-3">
                      <SparklesIcon aria-hidden />
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="grid gap-2">
                    <p className="type-eyebrow flex items-center gap-1.5 text-muted-foreground">
                      <MapPinIcon className="size-3.5" aria-hidden />
                      Hunza, Pakistan
                    </p>
                    <h3 className="type-display-sm">
                      <Link href="#cards" className="outline-none after:absolute after:inset-0">
                        Baltit Heights Lodge
                      </Link>
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <RatingStars value={4.8} count={5} size="sm" />
                      <PriceTag amount={7000} prefix="From" size="sm" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking HB-MYB2W6</CardTitle>
                    <CardDescription>Baltit Heights Lodge, Hunza</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Dates</dt>
                        <dd>20 to 25 Oct</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Room</dt>
                        <dd>Valley View Deluxe</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Status</dt>
                        <dd>
                          <Badge variant="success">Confirmed</Badge>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <PriceTag amount={56700} unit={null} size="sm" />
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </CardFooter>
                </Card>

                <div className="grid content-start gap-6">
                  <HotelCardSkeleton />
                </div>
              </div>
              <Example title="SkeletonText">
                <div className="max-w-md rounded-xl border bg-card p-5">
                  <SkeletonText lines={4} />
                </div>
              </Example>
            </DesignSection>

            <DesignSection
              id="navigation"
              title="Tabs and stepper"
              description="Underline tabs for editorial pages, segmented tabs for app screens, and a stepper for the booking flow."
            >
              <Example title="Tabs: underline">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="text-muted-foreground">
                    A family-run stone and timber lodge above Karimabad.
                  </TabsContent>
                  <TabsContent value="rooms" className="text-muted-foreground">
                    Three room types, from the Orchard Room to the Summit Suite.
                  </TabsContent>
                  <TabsContent value="reviews" className="text-muted-foreground">
                    Rated 4.8 from 5 reviews.
                  </TabsContent>
                  <TabsContent value="location" className="text-muted-foreground">
                    Fort Road, Karimabad, Hunza.
                  </TabsContent>
                </Tabs>
              </Example>
              <Example title="Tabs: segmented">
                <Tabs defaultValue="upcoming" variant="segmented">
                  <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upcoming" className="text-muted-foreground">
                    Two upcoming stays.
                  </TabsContent>
                  <TabsContent value="past" className="text-muted-foreground">
                    Four past stays.
                  </TabsContent>
                  <TabsContent value="cancelled" className="text-muted-foreground">
                    One cancelled booking.
                  </TabsContent>
                </Tabs>
              </Example>
              <Example title="Stepper">
                <div className="rounded-xl border bg-card p-5">
                  <Stepper steps={["Dates and room", "Your details", "Payment", "Confirmation"]} current={1} />
                </div>
              </Example>
            </DesignSection>

            <DesignSection
              id="overlays"
              title="Overlays and toasts"
              description="A modal for short decisions, a bottom sheet for mobile tasks, a side sheet for details, a popover for inline help and a tooltip for icon buttons. Escape closes all of them and focus returns to the trigger."
            >
              <Example title="Modal, sheets, popover, tooltip">
                <OverlayDemo />
              </Example>
              <Example title="Toasts">
                <ToastDemo />
              </Example>
            </DesignSection>

            <DesignSection
              id="gallery"
              title="Image gallery"
              description="Swipe or use the arrows to browse. Select a photo, or View all photos, to open the fullscreen lightbox with captions and thumbnails."
            >
              <ImageGallery images={galleryImages} />
            </DesignSection>

            <DesignSection
              id="states"
              title="Empty and error states"
              description="Every list needs an answer for nothing here yet and for something went wrong, each with a way forward."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <EmptyState
                    headingLevel="h3"
                    title="No trips booked yet"
                    description="When you book a stay it will appear here, with everything you need for check-in."
                    action={<Button>Find a stay</Button>}
                  />
                </Card>
                <Card>
                  <EmptyState
                    headingLevel="h3"
                    tone="error"
                    title="We could not load your bookings"
                    description="This is a problem on our side. Your bookings are safe; please try again."
                    action={
                      <Button variant="outline">
                        <RotateCwIcon aria-hidden />
                        Try again
                      </Button>
                    }
                  />
                </Card>
              </div>
            </DesignSection>

            <DesignSection
              id="motion"
              title="Motion"
              description="Feedback is quick: buttons, inputs and menus respond in 150 to 250ms. Decorative reveals take 400 to 600ms and never delay an action. Everything is reduced to a simple fade when the system asks for less motion."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["150ms", "Press, hover, focus", "Buttons scale to 98% on press."],
                  ["200 to 250ms", "Menus, dialogs, sheets", "Overlays fade and slide a short way."],
                  ["500ms", "Scroll reveals", "Editorial sections fade up once."],
                ].map(([time, title, text], index) => (
                  <Reveal key={time} delay={index * 0.08}>
                    <div className="h-full rounded-xl border bg-card p-5">
                      <p className="type-display-md text-primary">{time}</p>
                      <p className="type-title-sm mt-2">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </DesignSection>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}
