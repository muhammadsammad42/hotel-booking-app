// Prisma CLI configuration (migrations, seed, studio). Prisma 7 no longer
// loads .env on its own, so dotenv does it here.
import "dotenv/config";
import { defineConfig } from "prisma/config";

import { databaseUrl } from "./src/lib/db-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (non-pooled) connection: migrations need it.
    url: databaseUrl(process.env["DATABASE_URL"]),
  },
});
