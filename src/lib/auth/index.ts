import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";

import { authConfig } from "./config";

// Compared against when the email is unknown, so a wrong email takes as long
// to reject as a wrong password and does not reveal which accounts exist.
const timingSafeDummyHash = hashPassword("sarai-timing-placeholder");

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // The adapter stores users and OAuth accounts. Its types target the default
  // @prisma/client output; our client is generated into src/generated.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        const hash = user?.passwordHash ?? (await timingSafeDummyHash);
        const valid = await verifyPassword(parsed.data.password, hash);
        if (!user?.passwordHash || !valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
      },
    }),
  ],
});
