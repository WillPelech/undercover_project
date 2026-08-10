import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Local dev uses SQLite via the better-sqlite3 driver adapter (Prisma 7
// requires an explicit adapter for every connector). Swapping to Postgres
// (Neon) for production means: change the schema.prisma datasource provider
// to "postgresql", swap this adapter for @prisma/adapter-neon or
// @prisma/adapter-pg, and point DATABASE_URL at the Neon connection string.
function createClient() {
  const url = (process.env.DATABASE_URL ?? "file:./dev.db").replace(
    /^file:/,
    ""
  );
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const db = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
