import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseUrl } from "@/lib/db-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Prefer the pooled connection at runtime; fall back to the direct one.
  const connectionString = databaseUrl(process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL);

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // A few long-lived connections: opening one costs a TLS handshake and
      // authentication, and a burst of new connections can time out on a
      // database that has just woken up. Queries queue on the pool instead.
      max: 5,
      idleTimeoutMillis: 5 * 60_000,
      connectionTimeoutMillis: 20_000,
    }),
  });
}

// Next.js hot reload re-evaluates this module in development, so the client
// is cached on globalThis to avoid opening a new connection pool each time.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
