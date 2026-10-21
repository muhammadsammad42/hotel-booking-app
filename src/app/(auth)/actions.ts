"use server";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { clientIp, hit, LIMITS } from "@/lib/rate-limit";
import { fieldErrors, registerSchema, type FieldErrors, type RegisterInput } from "@/lib/validation/auth";

export type RegisterResult =
  | { ok: true }
  | { ok: false; fieldErrors?: FieldErrors<RegisterInput>; formError?: string };

/**
 * Creates a guest account. The form signs in with the same credentials
 * afterwards, so there is one sign-in path for everyone.
 */
export async function registerAction(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const limited = await hit(`register:ip:${await clientIp()}`, LIMITS.register);
  if (!limited.ok) return { ok: false, formError: "Too many accounts were created from this network recently. Please try again in an hour." };

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, fieldErrors: { email: "There is already an account with this email. Sign in instead." } };
  }

  try {
    await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: "GUEST" },
    });
  } catch {
    return { ok: false, formError: "We could not create your account just now. Please try again." };
  }

  return { ok: true };
}
