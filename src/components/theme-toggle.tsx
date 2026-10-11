"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Switches between the light and dark themes. */
function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons render; CSS shows the right one, so there is no flash. */}
      <SunIcon className="size-5 dark:hidden" aria-hidden />
      <MoonIcon className="hidden size-5 dark:block" aria-hidden />
      <span className="sr-only">Switch between light and dark theme</span>
    </Button>
  );
}

export { ThemeToggle };
