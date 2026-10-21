// Shared by the theme provider and the root layout (a server component).
export const THEME_STORAGE_KEY = "theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Sets the theme class on <html> before the page paints, so there is no
 * flash. Rendered by the root layout; keep it tiny and dependency-free.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("${DARK_QUERY}").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.classList.toggle("light",!d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;
