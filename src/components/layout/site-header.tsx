"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, SearchIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
}

/** Transparent at the top of the page; solid with a hairline once scrolled. */
function SiteHeader() {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-40 h-header border-b border-transparent",
        "transition-[background-color,border-color,box-shadow] duration-200 ease-soft",
        "data-[scrolled=true]:border-border data-[scrolled=true]:bg-background/92 data-[scrolled=true]:shadow-xs data-[scrolled=true]:backdrop-blur-md",
      )}
    >
      <PageContainer className="flex h-full items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Sarai home" className="rounded-md">
            <Logo className="h-8" />
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="relative inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-soft hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-1.5 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/hotels">
              <SearchIcon aria-hidden />
              Find a stay
            </Link>
          </Button>
          <MobileMenu isActive={isActive} />
        </div>
      </PageContainer>
    </header>
  );
}

function MobileMenu({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="size-5" aria-hidden />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Browse stays, destinations and your account.</SheetDescription>
          <Logo className="h-8" />
        </SheetHeader>
        <SheetBody>
          <nav aria-label="Mobile">
            <ul className="grid">
              {mainNav.map((item) => (
                <li key={item.href} className="border-b last:border-b-0">
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="type-display-md flex min-h-14 items-center rounded-md aria-[current=page]:text-primary"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button asChild size="lg" fullWidth>
              <Link href="/hotels">
                <SearchIcon aria-hidden />
                Find a stay
              </Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild variant="outline" fullWidth>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { SiteHeader };
