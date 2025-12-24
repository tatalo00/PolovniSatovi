#!/usr/bin/env tsx
/**
 * Migration diagnostic script
 * Checks environment variables, database connection, and migration status
 * 
 * Usage: npm run prisma:migrate:diagnose
 */

import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const DIRECT_URL = process.env.DIRECT_URL;
const DATABASE_URL = process.env.DATABASE_URL;

console.log("🔍 Prisma Migration Diagnostics\n");

// Check environment variables
console.log("1️⃣ Checking Environment Variables...\n");

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  console.error("   Add DATABASE_URL to .env.local");
  process.exit(1);
} else {
  console.log("✅ DATABASE_URL is set");
  const dbUrl = new URL(DATABASE_URL);
  console.log(`   Host: ${dbUrl.hostname}:${dbUrl.port || "5432"}`);
  console.log(`   Database: ${dbUrl.pathname.slice(1)}`);
}

if (!DIRECT_URL) {
  console.error("\n❌ DIRECT_URL is not set");
  console.error("   Migrations require DIRECT_URL for direct database connection");
  console.error("   Add DIRECT_URL to .env.local (use port 5432, not 6543)");
  console.error("\n   Example:");
  console.error("   DIRECT_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require");
  process.exit(1);
} else {
  console.log("\n✅ DIRECT_URL is set");
  const directUrl = new URL(DIRECT_URL);
  const port = directUrl.port || "5432";
  console.log(`   Host: ${directUrl.hostname}:${port}`);
  console.log(`   Database: ${directUrl.pathname.slice(1)}`);
  
  if (port === "6543") {
    console.error("\n⚠️  WARNING: DIRECT_URL is using port 6543 (connection pooler)");
    console.error("   Migrations require a direct connection on port 5432");
    console.error("   Update DIRECT_URL to use port 5432");
  } else if (port === "5432") {
    console.log("   ✅ Using direct connection (port 5432)");
  }
}

// Test database connection (will be tested via migrate status)
console.log("\n2️⃣ Testing Database Connection...\n");
console.log("   (Connection will be tested in the next step)");

// Check migration status (this also tests the connection)
console.log("\n3️⃣ Checking Database Connection & Migration Status...\n");

try {
  const output = execSync("npx prisma migrate status", {
    encoding: "utf-8",
    stdio: "pipe",
    env: { ...process.env, DIRECT_URL: DIRECT_URL! },
  });
  console.log("✅ Database connection successful!");
  console.log("\n" + output);
} catch (error: any) {
  const stdout = (error.stdout || "").toString();
  const stderr = (error.stderr || "").toString();
  const errorOutput = stdout + stderr + (error.message || "");
  
  // Check if it's a connection error
  if (errorOutput.includes("P1001") || errorOutput.includes("Can't reach database")) {
    console.error("❌ Database connection failed");
    console.error("   The database server is not reachable at the DIRECT_URL");
    console.error("\n   Check:");
    console.error("   1. DIRECT_URL is correct and uses port 5432 (not 6543)");
    console.error("   2. Database is not paused in Supabase dashboard");
    console.error("   3. Network/firewall allows connections");
    console.error("   4. SSL mode is correct (sslmode=require)");
    console.error("   5. Your IP is whitelisted (if IP restrictions are enabled)");
  } else if (errorOutput.includes("database schema is not empty")) {
    console.warn("⚠️  Database has tables but no migration history");
    console.warn("\n   This usually means migrations were applied manually");
    console.warn("   Solution: Run 'npm run prisma:migrate:resolve -- --applied [migration-name]'");
  } else if (errorOutput.includes("failed migrations")) {
    console.error("❌ There are failed migrations in the database");
    console.error("\n   Solution: Run 'npm run prisma:migrate:resolve -- --rolled-back [migration-name]'");
    console.error("   Then retry: npm run prisma:migrate:deploy");
  } else {
    console.error("❌ Error checking migration status");
    if (error.stdout) console.error("   stdout:", error.stdout.toString().substring(0, 200));
    if (error.stderr) console.error("   stderr:", error.stderr.toString().substring(0, 200));
  }
}

// Check schema drift (only if connection succeeded)
console.log("\n4️⃣ Checking for Schema Drift...\n");

try {
  // Use db pull to introspect current database schema
  const output = execSync("npx prisma db pull --print 2>&1", {
    encoding: "utf-8",
    stdio: "pipe",
    env: { ...process.env, DIRECT_URL: DIRECT_URL! },
  });
  console.log("✅ Can introspect database schema");
  console.log("   (Run 'npm run prisma:migrate:status' to see detailed migration status)");
} catch (error: any) {
  const errorOutput = (error.stdout || error.stderr || error.message || "").toString();
  if (errorOutput.includes("P1001") || errorOutput.includes("Can't reach database")) {
    console.warn("⚠️  Skipping schema drift check (database connection failed)");
  } else {
    console.warn("⚠️  Could not introspect database schema");
    console.warn("   This may be expected if the database is not accessible");
  }
}

console.log("\n✅ Diagnostics complete!\n");

console.log("Next steps:");
console.log("  • To create a new migration: npm run prisma:migrate:dev");
console.log("  • To apply pending migrations: npm run prisma:migrate:deploy");
console.log("  • To check status: npm run prisma:migrate:status");

