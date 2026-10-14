import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PageContainer } from "@/components/layout/page-container";
import { footerNav, site } from "@/lib/site";

const destinations = ["Maldives", "Santorini", "Bali", "Hunza", "Karachi", "Tokyo", "Istanbul", "Dolomites", "Dubai"];

function SiteFooter({ signedIn = false }: { signedIn?: boolean }) {
  const groups = footerNav.map((group) =>
    group.title === "Your trips" && signedIn
      ? { ...group, links: group.links.filter((link) => link.href === "/account/trips") }
      : group,
  );

  return (
    <footer className="mt-auto border-t bg-muted/50">
      <PageContainer className="py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr] lg:gap-20">
          <div className="max-w-sm">
            <Link href="/" aria-label="Sarai home" className="inline-block rounded-md">
              <Logo className="h-9" />
            </Link>
            <p className="type-display-md mt-6">{site.tagline}</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              A sarai was an inn on the old trade routes: a gate, a courtyard and a welcome at the end of a
              long road. We look for hotels that still feel like that.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="type-eyebrow text-muted-foreground">{group.title}</h2>
                <ul className="mt-3 grid">
                  {group.links.map((link) => {
                    const external = link.href.startsWith("http");
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="inline-flex min-h-11 items-center gap-1 rounded-sm text-sm text-foreground underline-offset-4 transition-colors duration-150 ease-soft hover:text-primary hover:underline"
                        >
                          {link.label}
                          {external && (
                            <>
                              <ArrowUpRightIcon className="size-3.5" aria-hidden />
                              <span className="sr-only">(opens in a new tab)</span>
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="type-eyebrow text-muted-foreground">Where we are</h2>
          <ul className="type-display-sm mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-foreground/80">
            {destinations.map((name, index) => (
              <li key={name} className="flex items-center gap-2.5">
                {name}
                {index < destinations.length - 1 && (
                  <span className="text-brass" aria-hidden>
                    /
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Sarai. A portfolio project with demo data; no real bookings are made.</p>
          <p>Photography from Unsplash.</p>
        </div>
      </PageContainer>
    </footer>
  );
}

export { SiteFooter };
