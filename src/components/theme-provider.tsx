"use client";

import * as React from "react";

import { DARK_QUERY, THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/theme";

// Light and dark themes. The choice ("light", "dark" or "system") is kept in
// localStorage; the class on <html> is set before first paint by THEME_SCRIPT
// in the root layout, so there is no flash. This replaces next-themes, whose
// inline <script> inside a client component makes React 19 warn.

export type Theme = "light" | "dark" | "system";

const CHANGE_EVENT = "sarai-theme-change";

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// "theme|resolved", a string so React can compare snapshots cheaply.
const getSnapshot = () => `${readTheme()}|${window.matchMedia(DARK_QUERY).matches ? "dark" : "light"}`;
const getServerSnapshot = () => "system|";

function apply(resolved: "light" | "dark") {
  const root = document.documentElement;
  // Switch without every colour transition firing at once.
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.style.colorScheme = resolved;
  void window.getComputedStyle(root).opacity;
  window.setTimeout(() => style.remove(), 0);
}

type ThemeContextValue = {
  theme: Theme;
  /** The theme in effect; undefined until the browser has been read. */
  resolvedTheme: "light" | "dark" | undefined;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue>({ theme: "system", resolvedTheme: undefined, setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [stored, system] = snapshot.split("|") as [Theme, "light" | "dark" | ""];
  const resolvedTheme = system ? (stored === "system" ? system : stored) : undefined;

  // Follow the system setting, and other tabs, after the first paint.
  React.useEffect(() => {
    if (resolvedTheme && !document.documentElement.classList.contains(resolvedTheme)) apply(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = React.useCallback((theme: Theme) => {
    try {
      if (theme === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode: the theme still changes for this page view.
    }
    apply(theme === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : theme);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = React.useMemo(() => ({ theme: stored, resolvedTheme, setTheme }), [stored, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
