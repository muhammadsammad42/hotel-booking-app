// Path rules and safe redirects. Pure functions: no Next.js or Auth.js imports.

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/account", "/admin", "/wishlist", "/book"];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((page) => matches(pathname, page));
}

/** Pages that need a signed-in user. */
export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => matches(pathname, prefix));
}

/** Pages that need the ADMIN role. */
export function isAdminPath(pathname: string) {
  return matches(pathname, "/admin");
}

/**
 * Returns a same-site path to send the user to after signing in. Anything
 * that could leave the site (absolute URLs, protocol-relative "//host",
 * backslash tricks) or loop back to the sign-in pages falls back to "/".
 */
export function safeCallbackUrl(value: string | null | undefined, fallback = "/") {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  let pathname: string;
  try {
    pathname = new URL(value, "https://sarai.invalid").pathname;
  } catch {
    return fallback;
  }
  if (isAuthPage(pathname)) return fallback;
  return value;
}

/** The sign-in page, remembering where to return to. */
export function loginPath(callbackUrl?: string) {
  const next = safeCallbackUrl(callbackUrl, "");
  return next ? `/login?callbackUrl=${encodeURIComponent(next)}` : "/login";
}
