import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { auth } from "./index";
import { loginPath } from "./redirect";

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "GUEST" | "ADMIN";
};

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { id, name, email, image, role } = session.user;
  return { id, name: name ?? null, email: email ?? null, image: image ?? null, role };
}

/**
 * For pages and server actions: the signed-in user, or a redirect to the
 * sign-in page that returns to `returnTo` afterwards.
 */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath(returnTo));
  return user;
}

/**
 * For admin pages and actions. The role is re-read from the database, so a
 * demoted admin loses access straight away rather than when the token expires.
 * Non-admins get a 404 rather than a hint that the page exists.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (record?.role !== "ADMIN") notFound();
  return { ...user, role: "ADMIN" };
}

/** For route handlers: a JSON error response, or the signed-in user. */
export async function userOrUnauthorized(): Promise<CurrentUser | Response> {
  const user = await getCurrentUser();
  return user ?? Response.json({ error: "Sign in to continue." }, { status: 401 });
}
