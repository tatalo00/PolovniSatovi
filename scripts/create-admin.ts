import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "../lib/generated/prisma/client";
import readline from "readline";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("=== Create Admin User ===\n");

  try {
    // Get email from command line argument or prompt
    const email = process.argv[2] || (await question("Enter the email of the user to make admin: "));

    if (!email) {
      console.error("Email is required!");
      console.error("Usage: npm run create:admin <email>");
      process.exit(1);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found!`);
      process.exit(1);
    }

    // Check if already admin
    if (user.role === "ADMIN") {
      console.log(`User ${email} is already an admin!`);
      process.exit(0);
    }

    // Update to admin
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
      },
    });

    console.log(`\n✅ Successfully promoted ${email} to ADMIN role!`);
    console.log(`\nYou can now:`);
    console.log(`- Log in at /auth/signin`);
    console.log(`- Access admin panel at /admin`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
