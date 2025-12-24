/**
 * Script to clean up orphaned message threads with null listingId
 * 
 * Run with: npx tsx scripts/cleanup-orphaned-threads.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Finding orphaned message threads with null listingId...\n");

  // Find threads with null listingId using raw query
  const orphanedThreads = await prisma.$queryRaw<{ id: string; buyerId: string; sellerId: string; createdAt: Date }[]>`
    SELECT id, "buyerId", "sellerId", "createdAt"
    FROM "MessageThread"
    WHERE "listingId" IS NULL
  `;

  if (orphanedThreads.length === 0) {
    console.log("✅ No orphaned threads found. Database is clean!");
    return;
  }

  console.log(`Found ${orphanedThreads.length} orphaned thread(s):\n`);
  
  for (const thread of orphanedThreads) {
    console.log(`  - Thread ID: ${thread.id}`);
    console.log(`    Buyer ID: ${thread.buyerId}`);
    console.log(`    Seller ID: ${thread.sellerId}`);
    console.log(`    Created: ${thread.createdAt}`);
    console.log();
  }

  // Count messages in orphaned threads
  const messageCount = await prisma.message.count({
    where: {
      threadId: { in: orphanedThreads.map(t => t.id) }
    }
  });

  console.log(`Total messages in orphaned threads: ${messageCount}\n`);

  // Ask for confirmation
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question("Do you want to delete these orphaned threads and their messages? (yes/no): ", resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== "yes") {
    console.log("\n❌ Cleanup cancelled.");
    return;
  }

  console.log("\n🗑️  Deleting orphaned threads and messages...");

  // Delete messages first (due to foreign key constraint)
  const deletedMessages = await prisma.message.deleteMany({
    where: {
      threadId: { in: orphanedThreads.map(t => t.id) }
    }
  });
  console.log(`  Deleted ${deletedMessages.count} message(s)`);

  // Delete threads using raw query since Prisma can't handle null listingId
  const deletedThreads = await prisma.$executeRaw`
    DELETE FROM "MessageThread"
    WHERE "listingId" IS NULL
  `;
  console.log(`  Deleted ${deletedThreads} thread(s)`);

  console.log("\n✅ Cleanup complete!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
