"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { HeartIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { toast } from "sonner";

import { loginPath } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { setWishlisted } from "@/lib/wishlist/actions";

type WishlistButtonProps = {
  hotelId: string;
  hotelName: string;
  initialSaved: boolean;
  signedIn: boolean;
  /** `overlay` sits on a photo; `outline` sits on the page. */
  variant?: "overlay" | "outline";
  className?: string;
};

const burst = Array.from({ length: 6 }, (_, index) => (index * Math.PI * 2) / 6);

/**
 * Heart that saves a hotel. Updates at once and rolls back if the server
 * refuses. Signed-out guests are asked to sign in instead.
 */
export function WishlistButton({
  hotelId,
  hotelName,
  initialSaved,
  signedIn,
  variant = "overlay",
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = React.useState(initialSaved);
  const [pulse, setPulse] = React.useState(0);
  const [, startTransition] = React.useTransition();

  // Follow the server value when it changes (after a refresh).
  const [serverSaved, setServerSaved] = React.useState(initialSaved);
  if (serverSaved !== initialSaved) {
    setServerSaved(initialSaved);
    setSaved(initialSaved);
  }

  function toggle(event: React.MouseEvent) {
    // The button sits inside a card whose link covers it.
    event.preventDefault();
    event.stopPropagation();

    if (!signedIn) {
      toast("Sign in to save stays", {
        description: "Your wishlist keeps the places you love in one list.",
        action: { label: "Sign in", onClick: () => router.push(loginPath(pathname)) },
      });
      return;
    }

    const next = !saved;
    setSaved(next);
    if (next) setPulse((value) => value + 1);
    startTransition(async () => {
      const result = await setWishlisted({ hotelId, saved: next });
      if (!result.ok) {
        setSaved(!next);
        toast.error("We could not update your wishlist", { description: "Please try again." });
        return;
      }
      toast.success(next ? "Saved to your wishlist" : "Removed from your wishlist", {
        description: hotelName,
        action: next ? { label: "View", onClick: () => router.push("/wishlist") } : undefined,
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${hotelName} from your wishlist` : `Save ${hotelName} to your wishlist`}
      className={cn(
        "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,transform] duration-150 ease-soft active:scale-90 focus-visible:ring-2 focus-visible:ring-ring",
        variant === "overlay"
          ? "bg-card/85 text-foreground shadow-xs backdrop-blur-sm hover:bg-card"
          : "border border-input bg-card text-foreground hover:bg-accent",
        className,
      )}
    >
      <m.span
        key={pulse}
        initial={pulse ? { scale: 0.6 } : false}
        animate={{ scale: [0.6, 1.3, 0.92, 1] }}
        transition={{ duration: 0.45, times: [0, 0.4, 0.7, 1] }}
        className="flex"
      >
        <HeartIcon
          className={cn(
            "size-5 transition-colors duration-200 ease-soft",
            saved ? "fill-primary text-primary" : "fill-transparent",
          )}
          aria-hidden
        />
      </m.span>
      <AnimatePresence>
        {pulse > 0 && saved && (
          <m.span key={`burst-${pulse}`} className="pointer-events-none absolute inset-0" aria-hidden>
            {burst.map((angle) => (
              <m.span
                key={angle}
                className="absolute top-1/2 left-1/2 size-1.5 rounded-full bg-primary"
                initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
                animate={{ x: `calc(-50% + ${Math.cos(angle) * 20}px)`, y: `calc(-50% + ${Math.sin(angle) * 20}px)`, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
