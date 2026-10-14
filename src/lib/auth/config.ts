import type { NextAuthConfig } from "next-auth";

import { isAdminPath, isAuthPage, isProtectedPath, loginPath, safeCallbackUrl } from "./redirect";

/**
 * Settings shared by the full Auth.js setup (src/lib/auth/index.ts) and the
 * proxy (src/proxy.ts). It must not import Prisma or bcrypt, so the proxy
 * stays small.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  // Credentials sign-in requires JWT sessions.
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "GUEST";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    /**
     * Optimistic route protection in the proxy. Pages, server actions and
     * route handlers check again on the server.
     */
    authorized({ auth, request }) {
      const { pathname, search } = request.nextUrl;
      const user = auth?.user;

      if (isAuthPage(pathname)) {
        if (!user) return true;
        const next = safeCallbackUrl(request.nextUrl.searchParams.get("callbackUrl"));
        return Response.redirect(new URL(next, request.nextUrl));
      }

      if (isProtectedPath(pathname) && !user) {
        return Response.redirect(new URL(loginPath(pathname + search), request.nextUrl));
      }

      if (isAdminPath(pathname) && user?.role !== "ADMIN") {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
