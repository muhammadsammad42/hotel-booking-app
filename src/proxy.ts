import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/config";

// Optimistic checks before the page renders: signed-out users are sent to the
// sign-in page, non-admins away from /admin, and signed-in users away from the
// sign-in pages. The rules live in authConfig.callbacks.authorized.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/book/:path*", "/login", "/register"],
};
