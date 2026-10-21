"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRightIcon, LogOutIcon, MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SearchIcon } from "lucide-react";
import * as m from "motion/react-m";

import { Logo } from "@/components/brand/logo";
import { UserAvatar, useSignOut } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CurrentUser } from "@/lib/auth/guards";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ADMIN_NAV, isActiveNav, SIDEBAR_COOKIE } from "./admin-nav";
import { CommandPalette, useCommandPalette } from "./command-palette";

function NavLinks({ collapsed = false, onNavigate, layoutId }: { collapsed?: boolean; onNavigate?: () => void; layoutId: string }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-1">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActiveNav(pathname, href);
        const link = (
          <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none transition-colors duration-150 ease-soft hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              "aria-[current=page]:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-card shadow-xs ring-1 ring-border"
                transition={{ duration: duration.base, ease: ease.soft }}
                aria-hidden
              />
            )}
            <Icon className={cn("relative size-5 shrink-0", active && "text-primary")} aria-hidden />
            <span className={cn("relative truncate", collapsed && "sr-only")}>{label}</span>
          </Link>
        );
        return (
          <li key={href}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AccountMenu({ user }: { user: CurrentUser }) {
  const signOut = useSignOut();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-11 items-center justify-center rounded-full outline-none transition-transform duration-150 ease-soft hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        aria-label={`Account menu for ${user.name ?? user.email}`}
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="truncate font-semibold">{user.name ?? "Admin"}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <ArrowUpRightIcon aria-hidden />
            View the public site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut}>
          <LogOutIcon aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The admin app frame: a sidebar that collapses to icons on desktop (the
 * choice is kept in a cookie so the server renders it the same way), a
 * drawer on mobile, a top bar with search, and the Ctrl+K command palette.
 */
export function AdminShell({ user, initialCollapsed, children }: { user: CurrentUser; initialCollapsed: boolean; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(initialCollapsed);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = useCommandPalette();

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "open"}; path=/admin; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-muted/40 transition-[width] duration-200 ease-soft lg:flex",
          collapsed ? "w-[4.75rem]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-0")}>
          <Link href="/admin" aria-label="Sarai admin home" className="flex items-center gap-2.5 rounded-md">
            <Logo variant={collapsed ? "mark" : "full"} className="h-8" />
            {!collapsed && <span className="rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>}
          </Link>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
          <NavLinks collapsed={collapsed} layoutId="admin-nav-desktop" />
        </nav>
        <div className={cn("grid gap-1 border-t p-3", collapsed && "justify-items-center")}>
          <Button asChild variant="ghost" className={cn("justify-start text-muted-foreground", collapsed && "w-11 justify-center px-0")}>
            <Link href="/">
              <ArrowUpRightIcon aria-hidden />
              <span className={cn(collapsed && "sr-only")}>View site</span>
            </Link>
          </Button>
          <Button variant="ghost" onClick={toggle} aria-expanded={!collapsed} className={cn("justify-start text-muted-foreground", collapsed && "w-11 justify-center px-0")}>
            {collapsed ? <PanelLeftOpenIcon aria-hidden /> : <PanelLeftCloseIcon aria-hidden />}
            <span className={cn(collapsed && "sr-only")}>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/92 px-gutter backdrop-blur-md lg:px-8">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 lg:hidden">
                <MenuIcon className="size-5" aria-hidden />
                <span className="sr-only">Open admin menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%-3rem,18rem)]">
              <SheetHeader>
                <SheetTitle className="sr-only">Admin menu</SheetTitle>
                <SheetDescription className="sr-only">Pages of the admin dashboard.</SheetDescription>
                <div className="flex items-center gap-2.5">
                  <Logo className="h-8" />
                  <span className="rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>
                </div>
              </SheetHeader>
              <SheetBody>
                <nav aria-label="Admin">
                  <NavLinks onNavigate={() => setDrawerOpen(false)} layoutId="admin-nav-mobile" />
                </nav>
                <div className="mt-6 border-t pt-4">
                  <SheetClose asChild>
                    <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground">
                      <Link href="/">
                        <ArrowUpRightIcon aria-hidden />
                        View site
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetBody>
            </SheetContent>
          </Sheet>
          <Link href="/admin" aria-label="Sarai admin home" className="rounded-md lg:hidden">
            <Logo variant="mark" className="h-8" />
          </Link>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex h-10 min-w-0 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground transition-colors duration-150 ease-soft outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-11 sm:w-72 lg:ml-0"
          >
            <SearchIcon className="size-4 shrink-0" aria-hidden />
            <span className="hidden truncate sm:inline">Search bookings, hotels…</span>
            <span className="sr-only sm:hidden">Search</span>
            <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-sans text-xs sm:inline">Ctrl K</kbd>
          </button>
          <div className="flex items-center gap-1 lg:ml-auto">
            <ThemeToggle />
            <AccountMenu user={user} />
          </div>
        </header>
        <main id="main" className="flex-1 px-gutter py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
