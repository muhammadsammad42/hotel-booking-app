# Sarai (hotel booking app)

Full stack hotel booking marketplace (Airbnb/Booking.com style): many hotels,
each with multiple room types. Guests browse, book and pay. A single ADMIN
role manages all hotels, rooms, rates and reservations.
See docs/PLAN.md for the architecture, folder conventions and phase plan.

## Tech stack
Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui (Radix), Motion,
lucide-react, sonner, Prisma 7, PostgreSQL (Neon), Auth.js (NextAuth),
Stripe Checkout, Zod, Vitest.

## Rules
- Use Server Components by default; Client Components only when needed.
- Validate all inputs with Zod and authorize on the server.
- Store money as integer cents. Store check-in/check-out as @db.Date.
- Never commit secrets. Keep .env out of git; maintain .env.example.
- Never print or log the contents of .env.
- Keep code in: src/app, src/components, src/lib, prisma/.
- Make small, focused changes and explain what you changed.

## Git rules
- Use plain git commands in the terminal for all commits and pushes.
- Commits must use the identity from my git config. Never change git config user.name or user.email, and never use --author.
- Commit messages must NOT contain "Co-Authored-By", "Generated with Claude Code", any mention of Claude, Anthropic or AI, or emoji.
- Use Conventional Commit style, e.g. "feat: add booking flow", "fix: correct availability check".
- Before committing, run git status and make sure .env and other secrets are not staged.
- Commit and push at the end of every phase: git add, git commit, then git push origin main (use -u on the first push).
- Never force push. Never rewrite history unless I ask.
- After pushing, show the output of: git log -1 --format="%an <%ae>%n%n%B"
- If a push fails (auth, remote missing), stop and tell me what to do. Do not try workarounds.

## Design and UX rules
- This is a portfolio showpiece. Every screen must look like a polished, premium product (Airbnb, Booking.com, Linear, Stripe quality), never like a tutorial project or a generic template.
- Follow the design system in docs/DESIGN.md and the theme tokens. Never hardcode random colours, spacing or font sizes.
- If a frontend-design skill or plugin is available, use it for every UI task.
- Every page needs a clear visual hierarchy, generous whitespace, loading skeletons, helpful empty states, friendly error states and smooth transitions.
- Mobile first. Touch targets at least 44px.
- Subtle, purposeful animation (hover, press, page and list transitions). Respect prefers-reduced-motion.
- Accessibility is required: semantic HTML, labels, visible focus rings, keyboard support, WCAG AA contrast.
- Support light and dark mode.
- Keep it fast: target Lighthouse 90+ for performance and accessibility; use next/image; prefer lightweight libraries.

## UI review checklist (run before every commit that touches UI)
- Check every new or changed screen at 375px, 768px and 1280px, in light and dark mode.
- Check loading, empty and error states.
- Check keyboard navigation and focus states.
- Fix anything that looks plain, cramped, misaligned or inconsistent with the design system.
