import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma client configuration with connection handling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Handle connection errors gracefully
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  
  // Test connection on startup in development
  prisma.$connect().catch((error) => {
    console.error("Failed to connect to database:", error);
    console.error("\nPlease check your DATABASE_URL in .env.local");
    console.error("For Supabase, you can find it in: Project Settings > Database > Connection string");
  });
}
