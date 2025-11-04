// Quick test script to verify database connection
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

const urlObj = new URL(databaseUrl);
console.log("Testing connection to:");
console.log("  Hostname:", urlObj.hostname);
console.log("  Port:", urlObj.port || 5432);
console.log("  Full URL:", databaseUrl.replace(/:[^:@]+@/, ":****@"));

// Try to connect using pg directly
import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

client
  .connect()
  .then(() => {
    console.log("✅ Connection successful!");
    return client.query("SELECT NOW()");
  })
  .then((result) => {
    console.log("✅ Query successful:", result.rows[0]);
    return client.end();
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });

