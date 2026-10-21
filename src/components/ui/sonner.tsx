"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/components/theme-provider";

/** Toast host. Trigger toasts with `toast()` from "sonner". */
function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      gap={10}
      icons={{
        success: <CircleCheckIcon className="size-5 text-success" />,
        info: <InfoIcon className="size-5 text-muted-foreground" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" />,
        error: <CircleAlertIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!shadow-overlay !gap-3 !p-4",
          title: "!text-sm !font-semibold",
          description: "!text-sm !text-muted-foreground",
          actionButton: "!h-9 !rounded-lg !bg-primary !px-3 !font-semibold !text-primary-foreground",
          cancelButton: "!h-9 !rounded-lg !bg-muted !px-3 !font-medium !text-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
