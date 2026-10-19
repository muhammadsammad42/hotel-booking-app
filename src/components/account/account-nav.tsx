"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, LuggageIcon, UserRoundIcon } from "lucide-react";
import * as m from "motion/react-m";

import { duration, ease } from "@/lib/motion";

const links = [
  { href: "/account/trips", label: "Trips", icon: LuggageIcon },
  { href: "/account/wishlist", label: "Wishlist", icon: HeartIcon },
  { href: "/account/profile", label: "Profile", icon: UserRoundIcon },
] as const;

/** Tabs across the top of every account page; the underline slides between them. */
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="-mx-gutter overflow-x-auto px-gutter print:hidden">
      <ul className="flex min-w-max gap-6 border-b">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-12 items-center gap-2 rounded-sm px-0.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-soft hover:text-foreground aria-[current=page]:text-foreground"
              >
                <Icon className="size-4" aria-hidden />
                {label}
                {active && (
                  <m.span
                    layoutId="account-nav-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={{ duration: duration.base, ease: ease.soft }}
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
