// Adds the user id and role to the Auth.js session and token types.
import type { DefaultSession } from "next-auth";
// Imported so the JWT augmentation below applies.
import "next-auth/jwt";

import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
