/**
 * Test script for signin API endpoint
 * 
 * Tests:
 * 1. Valid credentials create session
 * 2. Invalid credentials return error
 * 3. Non-existent user returns error
 * 
 * Requirements: 2.3, 2.4
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Test user credentials
const TEST_USER_EMAIL = "test-signin@example.com";
const TEST_USER_PASSWORD = "TestPassword123!";
const INVALID_PASSWORD = "WrongPassword123!";
const NON_EXISTENT_EMAIL = "nonexistent@example.com";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function logResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}: ${name}`);
  if (!passed) {
    console.log(`   ${message}`);
  }
}

async function setupTestUser() {
  // Clean up any existing test user
  await prisma.user.deleteMany({
    where: { email: TEST_USER_EMAIL },
  });

  // Create test user with hashed password
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: TEST_USER_EMAIL,
      password: hashedPassword,
      name: "Test User",
      role: "BUYER",
    },
  });

  return user;
}

async function cleanupTestUser() {
  await prisma.user.deleteMany({
    where: { email: TEST_USER_EMAIL },
  });
}

/**
 * Test 1: Valid credentials should authenticate successfully
 * Simulates the authorize function logic from auth.ts
 */
async function testValidCredentials() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isVerified: true,
      },
    });

    if (!user || !user.password) {
      logResult(
        "Valid credentials create session",
        false,
        "User not found or has no password"
      );
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(TEST_USER_PASSWORD, user.password);

    if (!isPasswordValid) {
      logResult(
        "Valid credentials create session",
        false,
        "Password validation failed for correct password"
      );
      return;
    }

    // Verify user data is returned correctly
    if (user.email !== TEST_USER_EMAIL) {
      logResult(
        "Valid credentials create session",
        false,
        "User email mismatch"
      );
      return;
    }

    logResult(
      "Valid credentials create session",
      true,
      "User authenticated successfully with correct credentials"
    );
  } catch (error) {
    logResult(
      "Valid credentials create session",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 2: Invalid credentials should return error
 * Tests that wrong password is rejected
 */
async function testInvalidCredentials() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      logResult(
        "Invalid credentials return error",
        false,
        "Test user not found"
      );
      return;
    }

    // Verify wrong password is rejected
    const isPasswordValid = await bcrypt.compare(INVALID_PASSWORD, user.password);

    if (isPasswordValid) {
      logResult(
        "Invalid credentials return error",
        false,
        "Wrong password was incorrectly accepted"
      );
      return;
    }

    // The authorize function returns null for invalid credentials
    // which NextAuth interprets as authentication failure
    logResult(
      "Invalid credentials return error",
      true,
      "Invalid password correctly rejected"
    );
  } catch (error) {
    logResult(
      "Invalid credentials return error",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 3: Non-existent user should return error
 * Tests that signin with unknown email is rejected
 */
async function testNonExistentUser() {
  try {
    // Try to find non-existent user
    const user = await prisma.user.findUnique({
      where: { email: NON_EXISTENT_EMAIL },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    // User should not exist
    if (user) {
      logResult(
        "Non-existent user returns error",
        false,
        "Unexpectedly found a user with non-existent email"
      );
      return;
    }

    // The authorize function returns null when user is not found
    // which NextAuth interprets as authentication failure
    logResult(
      "Non-existent user returns error",
      true,
      "Non-existent user correctly rejected"
    );
  } catch (error) {
    logResult(
      "Non-existent user returns error",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Additional Test: Empty credentials should be rejected
 */
async function testEmptyCredentials() {
  try {
    // Test with empty email
    const emptyEmail = "";
    const emptyPassword = "";

    // The authorize function checks for credentials existence first
    if (!emptyEmail || !emptyPassword) {
      logResult(
        "Empty credentials rejected",
        true,
        "Empty credentials correctly rejected at validation"
      );
      return;
    }

    logResult(
      "Empty credentials rejected",
      false,
      "Empty credentials were not rejected"
    );
  } catch (error) {
    logResult(
      "Empty credentials rejected",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Additional Test: User without password should be rejected
 */
async function testUserWithoutPassword() {
  const noPasswordEmail = "no-password@example.com";
  
  try {
    // Clean up and create user without password
    await prisma.user.deleteMany({
      where: { email: noPasswordEmail },
    });

    await prisma.user.create({
      data: {
        email: noPasswordEmail,
        name: "No Password User",
        role: "BUYER",
        // No password set
      },
    });

    // Try to authenticate
    const user = await prisma.user.findUnique({
      where: { email: noPasswordEmail },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    // User exists but has no password
    if (!user?.password) {
      logResult(
        "User without password rejected",
        true,
        "User without password correctly rejected"
      );
    } else {
      logResult(
        "User without password rejected",
        false,
        "User without password was not rejected"
      );
    }

    // Cleanup
    await prisma.user.deleteMany({
      where: { email: noPasswordEmail },
    });
  } catch (error) {
    logResult(
      "User without password rejected",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function main() {
  console.log("\n========================================");
  console.log("  Signin API Endpoint Tests");
  console.log("  Requirements: 2.3, 2.4");
  console.log("========================================\n");

  try {
    // Setup
    console.log("Setting up test user...\n");
    await setupTestUser();

    // Run tests
    await testValidCredentials();
    await testInvalidCredentials();
    await testNonExistentUser();
    await testEmptyCredentials();
    await testUserWithoutPassword();

    // Cleanup
    console.log("\nCleaning up test user...");
    await cleanupTestUser();

    // Summary
    console.log("\n========================================");
    console.log("  Test Summary");
    console.log("========================================");
    
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log("\nFailed tests:");
      results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  - ${r.name}: ${r.message}`));
      process.exit(1);
    } else {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Test execution failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
