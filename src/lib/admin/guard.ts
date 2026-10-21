import { getCurrentUser, type CurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

/**
 * For admin server actions and route handlers: the signed-in admin, or null.
 * The role is read from the database, never trusted from the session token.
 */
export async function getAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return record?.role === "ADMIN" ? { ...user, role: "ADMIN" } : null;
}

export const NOT_ADMIN = { ok: false, formError: "Only admins can do that. Sign in again with an admin account." } as const;
