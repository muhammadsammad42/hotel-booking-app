"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, LayoutDashboardIcon, LogOutIcon, LuggageIcon, MoonIcon, SunIcon, UserRoundIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/lib/auth/guards";
import { initials } from "@/lib/format";
import { useTheme } from "@/components/theme-provider";

/** Signs out without a full page load, then shows a toast. */
export function useSignOut() {
  const router = useRouter();
  return React.useCallback(async () => {
    await signOut({ redirect: false });
    toast("You are signed out", { description: "See you on your next trip." });
    router.push("/");
    router.refresh();
  }, [router]);
}

export function UserAvatar({ user, size }: { user: CurrentUser; size?: "sm" | "default" | "lg" }) {
  return (
    <Avatar size={size}>
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback className="bg-primary/15 font-semibold text-primary">
        {initials(user.name, user.email)}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserMenu({ user }: { user: CurrentUser }) {
  const { resolvedTheme, setTheme } = useTheme();
  const handleSignOut = useSignOut();
  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-11 items-center justify-center rounded-full outline-none transition-transform duration-150 ease-soft hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
        aria-label={`Account menu for ${user.name ?? user.email}`}
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="truncate font-semibold">{user.name ?? "Your account"}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account/trips">
              <LuggageIcon aria-hidden />
              My trips
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/wishlist">
              <HeartIcon aria-hidden />
              Wishlist
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/profile">
              <UserRoundIcon aria-hidden />
              Profile
            </Link>
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboardIcon aria-hidden />
                Admin dashboard
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
          {isDark ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOutIcon aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
