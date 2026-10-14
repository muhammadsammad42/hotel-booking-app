import { describe, expect, it } from "vitest";

import { isAdminPath, isAuthPage, isProtectedPath, loginPath, safeCallbackUrl } from "./redirect";

describe("safeCallbackUrl", () => {
  it("keeps same-site paths with their query string", () => {
    expect(safeCallbackUrl("/book?hotel=coral-lagoon-resort&checkIn=2026-11-01")).toBe(
      "/book?hotel=coral-lagoon-resort&checkIn=2026-11-01",
    );
    expect(safeCallbackUrl("/account/trips")).toBe("/account/trips");
  });

  it("rejects anything that could leave the site", () => {
    expect(safeCallbackUrl("https://evil.example/phish")).toBe("/");
    expect(safeCallbackUrl("//evil.example")).toBe("/");
    expect(safeCallbackUrl("/\\evil.example")).toBe("/");
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/");
    expect(safeCallbackUrl("account")).toBe("/");
  });

  it("does not loop back to the sign-in pages", () => {
    expect(safeCallbackUrl("/login")).toBe("/");
    expect(safeCallbackUrl("/register?callbackUrl=/x")).toBe("/");
  });

  it("falls back for empty values", () => {
    expect(safeCallbackUrl(undefined)).toBe("/");
    expect(safeCallbackUrl(null, "/search")).toBe("/search");
    expect(safeCallbackUrl("")).toBe("/");
  });
});

describe("path rules", () => {
  it("protects account, admin, wishlist and booking pages", () => {
    expect(isProtectedPath("/account/trips")).toBe(true);
    expect(isProtectedPath("/admin")).toBe(true);
    expect(isProtectedPath("/wishlist")).toBe(true);
    expect(isProtectedPath("/book/abc")).toBe(true);
    expect(isProtectedPath("/hotels/coral-lagoon-resort")).toBe(false);
    expect(isProtectedPath("/bookmarks")).toBe(false);
  });

  it("knows the admin and sign-in pages", () => {
    expect(isAdminPath("/admin/hotels")).toBe(true);
    expect(isAdminPath("/administrator")).toBe(false);
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/register")).toBe(true);
    expect(isAuthPage("/logins")).toBe(false);
  });

  it("builds a sign-in link that returns to the page", () => {
    expect(loginPath("/book?room=1")).toBe("/login?callbackUrl=%2Fbook%3Froom%3D1");
    expect(loginPath()).toBe("/login");
    expect(loginPath("https://evil.example")).toBe("/login");
  });
});
