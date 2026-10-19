# Sarai design system

Sarai looks like a printed travel magazine: warm paper, ink, terracotta and
unhurried photography. A sarai was an inn on the old trade routes, and the
logo is its gate, a pointed archway.

Every token and component described here is shown live at `/design`, in both
themes. Check a change there before using it in a page.

## Principles

1. **Photography first.** Type and colour stay quiet so the place does the
   talking.
2. **Warm, not loud.** Paper tones and hairline borders. Terracotta is saved
   for actions.
3. **Never in the way.** Booking is fast and plain. Decoration stops at the
   checkout.

## Two registers

The system has two registers. Pick one per page; do not mix them.

| | Editorial | App |
| --- | --- | --- |
| Used on | Home, search results, hotel and room pages | Booking flow, account, admin |
| Headings | `type-display-*` (Fraunces serif) | `type-title-*` (Instrument Sans) |
| Section spacing | `<Section>` (`py-section`, 64 to 120px) | `<Section spacing="compact">` (32 to 48px) |
| Page width | `<PageContainer>` (1280px) | `<PageContainer width="app">` (1024px) |
| Motion | `Reveal` on scroll is allowed | Feedback only; no reveals |
| Calls to action | One primary button per view | One primary button per step, `size="lg"`, always visible |

Rules that hold in both:

- **The primary button is never understated.** Search, Reserve, Continue and
  Pay use `<Button>` in its default `primary` variant. Do not use `outline`,
  `ghost` or `link` for the action that moves a booking forward.
- **One primary button per view.** Everything else is `secondary`, `outline`
  or `ghost`.
- **Prices and numbers are always sans** with `tabular-nums`, including on
  editorial pages. Use `PriceTag`.

## Tokens

Tokens are CSS variables defined in `src/app/globals.css` and exposed as
Tailwind utilities. **Never write a hex value, a pixel font size or a custom
shadow in a component.** If a token is missing, add it to `globals.css` and
document it here.

### Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#FAF6EF` ivory | `#171311` espresso | Page background |
| `card` | `#FFFCF7` | `#211B17` | Cards, inputs, raised surfaces |
| `popover` | `#FFFCF7` | `#261F1A` | Menus, dialogs, sheets, toasts |
| `muted` | `#EFE6D8` sand | `#2A231E` | Quiet fills, skeletons |
| `accent` | `#F3EBDF` | `#2F2721` | Hover fill for ghost buttons and menu items |
| `foreground` | `#1F1A17` ink | `#F3ECE2` | Text and icons |
| `muted-foreground` | `#665A50` | `#B5A898` | Secondary text |
| `primary` | `#B4532A` terracotta | `#D97B4F` | Primary actions, links, selection |
| `primary-hover` | `#9A4421` | `#E48D63` | Hover state of primary |
| `secondary` | `#3F4A3C` olive | `#4A5746` | Secondary solid buttons |
| `brass` | `#C29A5B` | `#D2AE74` | Small accents: featured badges, dividers |
| `star` | `#B9791F` | `#E0A84E` | Rating stars |
| `success` | `#356348` | `#82B594` | Confirmed, available |
| `warning` | `#8F5A0C` | `#DBA74A` | Pending, few rooms left |
| `destructive` | `#A8322D` | `#E5766B` | Errors, cancel, delete |
| `border` | `#E2D6C4` | `#3A302A` | Hairlines and dividers |
| `input` | `#96846F` | `#7D6F62` | Borders of form controls |
| `ring` | `#B4532A` | `#D97B4F` | Focus ring |
| `scrim` | ink at 55% | black at 65% | Backdrop behind dialogs and sheets |
| `lightbox` | `#0F0C0A` | `#0F0C0A` | Photo lightbox, dark in both themes |

Each solid colour has a `-foreground` partner for text placed on it, for
example `bg-primary text-primary-foreground`.

Contrast, measured against WCAG 2.1 AA:

| Pair | Light | Dark | Needs |
| --- | --- | --- | --- |
| Text on background | 16.0 | 15.7 | 4.5 |
| Secondary text on background | 6.2 | 7.9 | 4.5 |
| Secondary text on `muted` | 5.4 | 6.6 | 4.5 |
| Primary button label | 4.8 | 6.2 | 4.5 |
| Primary as link text | 4.6 | 6.1 | 4.5 |
| Destructive text | 6.2 | 6.3 | 4.5 |
| Success text | 6.4 | 7.9 | 4.5 |
| Warning text | 5.4 | 8.5 | 4.5 |
| Form control border | 3.4 | 3.8 | 3.0 |
| Rating stars | 3.4 | 8.7 | 3.0 |

`brass` and `border` do not have enough contrast for text. Use them for fills
and lines only.

### Dark mode

`next-themes` puts `.dark` on `<html>`; the default follows the system
setting, and `ThemeToggle` switches it. Components read tokens, so they adapt
without `dark:` classes. Use a `dark:` class only for something a token cannot
express, such as swapping an icon. Adding `.light` or `.dark` to any element
forces that theme on its subtree; `/design` uses this for its side-by-side
previews.

### Typography

Two Google Fonts, loaded with `next/font` in `src/app/layout.tsx`:

- **Fraunces** (`font-display`): a soft serif for editorial headlines.
- **Instrument Sans** (`font-sans`): interface, forms, body text and numbers.

| Class | Size | Use |
| --- | --- | --- |
| `type-display-2xl` | 44 to 76px | Home hero only |
| `type-display-xl` | 36 to 56px | Page titles on editorial pages |
| `type-display-lg` | 28 to 40px | Section headings on editorial pages |
| `type-display-md` | 22 to 28px | Hotel and room names in lists; empty states |
| `type-display-sm` | 19px | Card titles |
| `type-title-lg` | 24px | Page titles in booking, account, admin; dialog titles |
| `type-title-md` | 19px | Card and panel headings |
| `type-title-sm` | 16px | Small headings, table headers |
| `type-lead` | 17 to 19px | Intro paragraph under a heading |
| `text-base` | 16px | Body text |
| `text-sm` | 14px | Supporting text, labels, buttons |
| `text-xs` | 12px | Badges, captions |
| `type-eyebrow` | 12px caps | Label above a heading: location, category |

Display sizes are fluid, so they need no breakpoint classes. Set an italic
word inside a display heading with `<em>` for emphasis, at most once per
heading. Colour is separate from the type class: add `text-muted-foreground`
or `text-primary` as needed.

### Radius, shadow, spacing

| Token | Value | Use |
| --- | --- | --- |
| `rounded-sm` | 4px | Checkboxes, inline links |
| `rounded-md` | 6px | Menu items, skeleton lines, thumbnails |
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 10px | Cards, popovers, galleries |
| `rounded-2xl` | 14px | Dialogs, sheets, hero images |
| `rounded-full` | pill | Badges, avatars, round icon buttons |
| `shadow-xs` | hairline | Scrolled header, active segmented tab |
| `shadow-lift` | soft, warm | Interactive card on hover |
| `shadow-overlay` | deep | Menus, popovers, dialogs, sheets, toasts |
| `shadow-cta` | terracotta glow | Primary button only |
| `px-gutter` | 16 to 40px | Side padding of every page |
| `py-section` | 64 to 120px | Editorial section rhythm |
| `py-section-compact` | 32 to 48px | App section rhythm |
| `h-header` | 72px | Header height; also used for scroll offsets |
| `max-w-page` / `max-w-app` / `max-w-prose` | 1280 / 1024 / 672px | Content widths |

Inside components, use the standard Tailwind spacing scale (multiples of
4px). Surfaces are separated by a 1px `border`, not by shadow.

### Motion

| Speed | Duration | Use |
| --- | --- | --- |
| Feedback | 150ms | Hover, press, focus, colour changes |
| Overlays | 200 to 250ms | Menus, popovers, dialogs, sheets |
| Reveals | 500ms | `Reveal` on editorial sections, image zoom on card hover |

- Easing is `ease-soft` everywhere.
- Buttons scale to 98% while pressed.
- Nothing decorative may delay an action: no reveal on forms, booking steps
  or the first screen of a page.
- `prefers-reduced-motion` is honoured globally. CSS transitions and
  animations are cut to almost nothing, and Motion drops movement and keeps
  a simple fade.
- JavaScript animation uses Motion (`motion/react-m`) with the tokens in
  `src/lib/motion.ts`. `LazyMotion` is set up in `Providers`, so import `m`
  components, not `motion`.
- `Reveal` is CSS-driven: content is visible in the server HTML, and only
  sections still below the fold after hydration are hidden and faded in.

### Photography

- Hotel cards use a tall 4:5 image; galleries use 4:3 on mobile and 16:9 from
  tablet up.
- Always use `next/image` with a `sizes` attribute and real alt text that
  describes what the photo shows.
- Photos are resized by the Unsplash CDN through `src/lib/image-loader.ts`.
  Images from other hosts are served unchanged.
- Images zoom to 103% over 500ms when their card is hovered. No filters or
  overlays, except a scrim under text placed on a photo.

## Components

Components live in `src/components`. `ui/` holds the building blocks, most of
them Radix primitives from shadcn/ui restyled for Sarai. Add further shadcn
components with `npx shadcn@latest add <name>`, then restyle them with tokens
before use.

### Actions

| Component | Use it for | Notes |
| --- | --- | --- |
| `Button` | Every action | Variants: `primary` (default), `secondary`, `outline`, `ghost`, `destructive`, `link`. Sizes: `lg` for booking actions, `md` default, `sm` for dense screens, `icon`, `icon-sm`. `loading` shows a spinner and blocks clicks. `asChild` turns a `Link` into a button. |
| `ThemeToggle` | Switching theme | Already in the header. |

Icon-only buttons need a label: `<span className="sr-only">Save</span>`.
Small sizes grow to 44px on touch screens automatically.

### Forms

| Component | Use it for | Notes |
| --- | --- | --- |
| `Field` | Wrapping every control | Adds the label, hint and error and links them for screen readers. Pass `error` to mark the control invalid. |
| `Input`, `Textarea` | Text entry | 44px tall, 16px text on mobile so iOS does not zoom. |
| `Select` | Choosing one of a short list | Use a native `<select>` only inside very dense admin tables. |
| `Checkbox` | Yes/no and multi-select | Wrap it in a `<label>` with its text; the hit area is 44px. |
| `DateRangePicker` | Check-in and check-out | Popover with two months on desktop, bottom sheet with one month on mobile. `minNights`, `maxNights` and `unavailable` limit the selection. |
| `Calendar` | Other date needs | The month grid behind `DateRangePicker`. |
| `StayDatePicker` | Dates on a hotel page | `DateRangePicker` with prices under each date, cheaper dates in green and sold-out nights struck through. |
| `StarInput` | Giving a 1-5 rating | Native radio buttons, so arrow keys and screen readers work; stars fill on hover. |
| `PriceBreakdown` | Any price of a stay | Nightly rate, taxes, service fee and total, with amounts that roll when they change. |

Validate with Zod on the server and show the message through `Field`'s
`error`. Never rely on colour alone: errors have an icon and text.

### Data display

| Component | Use it for | Notes |
| --- | --- | --- |
| `Badge` | Status and short labels | `success` confirmed, `warning` pending, `destructive` cancelled, `brass` featured, `primary` new, `neutral` and `outline` for facts. |
| `RatingStars` | An average rating | Read-only. Pass `count` to show the number of reviews. |
| `PriceTag` | Every price | Takes cents. `prefix="From"`, `originalAmount` for a struck-through price, `unit={null}` for totals. |
| `Avatar` | A guest's picture or initials | Sizes `sm`, default, `lg`. |
| `Card` | A bordered surface | `interactive` when the whole card is a link: put the link on the title and stretch it with `after:absolute after:inset-0`. |
| `ImageGallery` | Hotel and room photos | Carousel that opens a fullscreen `Lightbox` with captions and thumbnails. |
| `Carousel` | Other swipeable rows | The Embla wrapper behind the gallery. |

### Navigation

| Component | Use it for | Notes |
| --- | --- | --- |
| `Tabs` | Switching views in place | `underline` (default) on editorial pages; `variant="segmented"` on app screens. |
| `AnimatedTabs` | Tabbed lists on app screens | Segmented, with a sliding chip, a fade on switch (not on first render) and the tab kept in a query parameter. |
| `Stepper` | The booking flow | Shows only the current label on small screens. |
| `SiteHeader`, `SiteFooter` | The app shell | Rendered once in the root layout. The header is transparent at the top and solid once scrolled. |
| `PageContainer`, `Section` | Page layout | See "Two registers". |

### Overlays

| Component | Use it for | Notes |
| --- | --- | --- |
| `Dialog` | A short decision or confirmation | Keep it to one question and two buttons. |
| `Sheet` | A task that needs room | `side="bottom"` on mobile for filters, dates and summaries; `side="right"` for the menu and detail panels. |
| `Popover` | Inline help or a small picker | Not for anything the guest must act on. |
| `Tooltip` | Naming an icon button | Never put essential information only in a tooltip. |
| `toast` (sonner) | Confirming a finished action | Success, error, undo. Do not use toasts for form errors. |

Dialogs and sheets must have a title (`DialogTitle`, `SheetTitle`); hide it
with `sr-only` if the design has none. Escape closes every overlay and focus
returns to the trigger.

### Booking flow

| Component | Use it for | Notes |
| --- | --- | --- |
| `BookingSteps` | Top of every booking page | Details, Payment, Confirmed. |
| `StaySummary` | The stay being booked | Hotel photo, room, dates, guests and `PriceBreakdown`; sticky on desktop. |
| `HoldCountdown` | Pending bookings | Turns amber in the last five minutes and refreshes the page when the hold ends. |
| `CopyButton` | Booking references | Confirms with a tick and a toast. |
| `TripCard`, `NextTrip` | My trips | A booking as a photo card; the next trip as a hero with a live countdown. |
| `Receipt` | Printing a booking | Hidden on screen. Print styles hide the rest of the page and print black on white. |
| `Confetti` | The confirmation page only | A short burst; skipped when the system asks for less motion. |

### States

Every screen that loads data needs all three:

| State | Component | Notes |
| --- | --- | --- |
| Loading | `Skeleton`, `SkeletonText`, `HotelCardSkeleton` | Match the shape of the real content so the page does not jump. |
| Empty | `EmptyState` | Say what will appear here and offer the next step. |
| Error | `EmptyState tone="error"` | Say what happened in plain words and offer "Try again". |

### Motion

| Component | Use it for | Notes |
| --- | --- | --- |
| `Reveal` | Fading an editorial section up on scroll | Stagger a group with small `delay` steps. Never on forms or the first screen. |

## Brand assets

| Asset | Where |
| --- | --- |
| `Logo` component | `src/components/brand/logo.tsx`. `variant="mark"` for the archway alone. The wordmark takes the current text colour. |
| SVG files | `public/brand/sarai-logo.svg`, `sarai-logo-light.svg`, `sarai-mark.svg` |
| Favicon | `src/app/icon.svg`, `src/app/apple-icon.png` |

The wordmark is Fraunces 500 converted to outlines, so it renders without the
font. Keep clear space around the logo equal to the width of the archway.
Do not recolour the mark or place it on a photo without a scrim.

## Accessibility

- **Contrast:** WCAG AA, as measured above.
- **Focus:** every focusable element shows a 2px terracotta outline. Do not
  remove it; if you add `outline-none`, add a ring in its place.
- **Touch:** targets are at least 44px on touch screens.
- **Keyboard:** everything works without a mouse. "Skip to content" is the
  first tab stop on every page.
- **Semantics:** one `h1` per page, headings in order, `nav` landmarks
  labelled, lists as lists.
- **Images:** real alt text; `alt=""` only for decoration.

## UI review

Before a commit that touches UI, run the checklist in `CLAUDE.md`: every
changed screen at 375, 768 and 1280px in light and dark; loading, empty and
error states; keyboard and focus; and no horizontal scrolling at any width.
