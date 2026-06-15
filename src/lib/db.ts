import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Define a global object typing to persist the client across hot-reloads
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  db = new PrismaClient({ adapter });
} else {
  // In development, preserve the connection pool on globalThis
  if (!globalForPrisma.prisma) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  db = globalForPrisma.prisma;
}

export { db };