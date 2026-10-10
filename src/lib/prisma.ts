import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Prefer the pooled connection at runtime; fall back to the direct one.
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Next.js hot reload re-evaluates this module in development, so the client
// is cached on globalThis to avoid opening a new connection pool each time.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
