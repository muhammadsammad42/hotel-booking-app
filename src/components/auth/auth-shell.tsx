import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthShellProps = {
  photo: { url: string; alt: string };
  /** Short editorial caption over the photo. */
  caption: { place: string; text: string };
  children: React.ReactNode;
};

/**
 * Split-screen frame for sign-in and sign-up: an editorial photo on the left
 * (from 1024px) and a compact app-register form on the right.
 */
function AuthShell({ photo, caption, children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <figure className="relative hidden overflow-hidden bg-muted lg:block">
        <Image src={photo.url} alt={photo.alt} fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-lightbox/85 via-lightbox/15 to-lightbox/30" aria-hidden />
        <Link
          href="/"
          aria-label="Sarai home"
          className="absolute top-8 left-10 rounded-md text-lightbox-foreground"
        >
          <Logo className="h-9" />
        </Link>
        <figcaption className="absolute inset-x-0 bottom-0 max-w-xl p-10 text-lightbox-foreground">
          <p className="type-eyebrow text-lightbox-foreground/80">{caption.place}</p>
          <p className="type-display-md mt-3 text-pretty">{caption.text}</p>
        </figcaption>
      </figure>

      <main id="main" className="flex min-h-dvh flex-col px-gutter py-6 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Sarai home" className="rounded-md lg:hidden">
            <Logo className="h-8" />
          </Link>
          <Link
            href="/"
            className="hidden min-h-11 items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors duration-150 ease-soft hover:text-foreground lg:inline-flex"
          >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Back to Sarai
          </Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-center text-xs text-muted-foreground">
          A portfolio project with demo data. No real bookings or payments are made.
        </p>
      </main>
    </div>
  );
}

export { AuthShell };
