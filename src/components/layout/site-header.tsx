"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, LogOutIcon, LuggageIcon, MenuIcon, SearchIcon, UserRoundIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PageContainer } from "@/components/layout/page-container";
import { UserAvatar, UserMenu, useSignOut } from "@/components/layout/user-menu";
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
import type { CurrentUser } from "@/lib/auth/guards";
import { loginPath } from "@/lib/auth/redirect";
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
function SiteHeader({ user }: { user: CurrentUser | null }) {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const signInHref = loginPath(pathname);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-40 h-header border-b border-transparent print:hidden",
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
          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href={signInHref}>Sign in</Link>
              </Button>
            </>
          )}
          <Button asChild className="hidden md:inline-flex">
            <Link href="/search">
              <SearchIcon aria-hidden />
              Find a stay
            </Link>
          </Button>
          {user && (
            <span className="md:hidden">
              <ThemeToggle />
            </span>
          )}
          <MobileMenu user={user} isActive={isActive} signInHref={signInHref} />
        </div>
      </PageContainer>
    </header>
  );
}

function MobileMenu({
  user,
  isActive,
  signInHref,
}: {
  user: CurrentUser | null;
  isActive: (href: string) => boolean;
  signInHref: string;
}) {
  const handleSignOut = useSignOut();
  const accountLinks = [
    { href: "/account/trips", label: "My trips", icon: LuggageIcon },
    { href: "/account/profile", label: "Profile", icon: UserRoundIcon },
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin dashboard", icon: LayoutDashboardIcon }] : []),
  ];

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
        <SheetBody className="grid content-start gap-8">
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

          {user && (
            <div className="grid gap-1">
              <div className="mb-2 flex items-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name ?? "Your account"}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {accountLinks.map(({ href, label, icon: Icon }) => (
                <SheetClose asChild key={href}>
                  <Link
                    href={href}
                    className="flex min-h-11 items-center gap-3 rounded-md px-1 text-sm font-medium hover:text-primary"
                  >
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    {label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          )}
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button asChild size="lg" fullWidth>
              <Link href="/search">
                <SearchIcon aria-hidden />
                Find a stay
              </Link>
            </Button>
          </SheetClose>
          {user ? (
            <SheetClose asChild>
              <Button variant="outline" fullWidth onClick={handleSignOut}>
                <LogOutIcon aria-hidden />
                Sign out
              </Button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Button asChild variant="outline" fullWidth>
                <Link href={signInHref}>Sign in</Link>
              </Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { SiteHeader };
