import "server-only";

import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient singleton for serverless environments
 * 
 * In serverless (Vercel), each function invocation may create a new instance.
 * We use a global singleton to reuse connections within the same process.
 * 
 * Connection pooling is handled by Supabase PgBouncer (configured in DATABASE_URL).
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    // Only log errors in production, more verbose in development
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Datasource is configured via DATABASE_URL env var
    // which points to Supabase PgBouncer for connection pooling
  });
}

// Use existing instance or create new one
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures connections are properly closed when the process exits
 */
async function gracefulShutdown() {
  await prisma.$disconnect();
}

// Register shutdown handlers (only in long-running processes, not serverless)
if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
  process.on("beforeExit", gracefulShutdown);
}
