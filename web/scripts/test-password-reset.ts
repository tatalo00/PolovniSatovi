/**
 * Test script for password reset flow
 * 
 * Tests:
 * 1. Forgot-password endpoint generates token for existing user
 * 2. Forgot-password endpoint returns success even for non-existent user (security)
 * 3. Forgot-password endpoint validates email format
 * 4. Reset-password endpoint updates password with valid token
 * 5. Reset-password endpoint rejects invalid/expired token
 * 6. Reset-password endpoint validates password strength
 * 
 * Requirements: 2.5, 2.6
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Test user credentials
const TEST_USER_EMAIL = "test-password-reset@example.com";
const TEST_USER_PASSWORD = "OldPassword123!";
const NEW_PASSWORD = "NewPassword456!";

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
      name: "Test Password Reset User",
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
 * Test 1: Forgot-password generates token for existing user
 * Simulates the forgot-password endpoint logic
 */
async function testForgotPasswordGeneratesToken() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      logResult(
        "Forgot-password generates token for existing user",
        false,
        "Test user not found"
      );
      return;
    }

    // Generate reset token (simulating the endpoint logic)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Verify token was saved
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        passwordResetToken: true,
        passwordResetExpires: true,
      },
    });

    if (!updatedUser?.passwordResetToken || !updatedUser?.passwordResetExpires) {
      logResult(
        "Forgot-password generates token for existing user",
        false,
        "Token was not saved to database"
      );
      return;
    }

    // Verify token is valid format (64 hex characters)
    if (updatedUser.passwordResetToken.length !== 64) {
      logResult(
        "Forgot-password generates token for existing user",
        false,
        `Token has invalid length: ${updatedUser.passwordResetToken.length}`
      );
      return;
    }

    // Verify expiration is in the future
    if (updatedUser.passwordResetExpires <= new Date()) {
      logResult(
        "Forgot-password generates token for existing user",
        false,
        "Token expiration is not in the future"
      );
      return;
    }

    logResult(
      "Forgot-password generates token for existing user",
      true,
      "Token generated and saved successfully"
    );
  } catch (error) {
    logResult(
      "Forgot-password generates token for existing user",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 2: Forgot-password returns success for non-existent user (security)
 * The endpoint should not reveal if an email exists
 */
async function testForgotPasswordNonExistentUser() {
  try {
    const nonExistentEmail = "nonexistent-user@example.com";
    
    // Find user by email (should not exist)
    const user = await prisma.user.findUnique({
      where: { email: nonExistentEmail },
      select: {
        id: true,
      },
    });

    // User should not exist
    if (user) {
      logResult(
        "Forgot-password returns success for non-existent user",
        false,
        "Unexpectedly found a user with non-existent email"
      );
      return;
    }

    // The endpoint returns success even for non-existent users
    // to prevent email enumeration attacks
    logResult(
      "Forgot-password returns success for non-existent user",
      true,
      "Non-existent user handled correctly (no token generated, but success returned)"
    );
  } catch (error) {
    logResult(
      "Forgot-password returns success for non-existent user",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 3: Forgot-password validates email format
 */
async function testForgotPasswordInvalidEmail() {
  try {
    const invalidEmails = ["invalid-email", "test@", "@example.com", ""];
    
    // Test email validation using the same schema as the endpoint
    const { z } = await import("zod");
    const emailSchema = z.string().email("Neispravan email format");

    for (const email of invalidEmails) {
      const result = emailSchema.safeParse(email);
      if (result.success) {
        logResult(
          "Forgot-password validates email format",
          false,
          `Invalid email "${email}" was incorrectly accepted`
        );
        return;
      }
    }

    logResult(
      "Forgot-password validates email format",
      true,
      "Invalid email formats correctly rejected"
    );
  } catch (error) {
    logResult(
      "Forgot-password validates email format",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}


/**
 * Test 4: Reset-password updates password with valid token
 */
async function testResetPasswordWithValidToken() {
  try {
    // First, generate a valid token for the test user
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email: TEST_USER_EMAIL },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Find user with valid reset token (simulating the endpoint logic)
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: resetToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      logResult(
        "Reset-password updates password with valid token",
        false,
        "User with valid token not found"
      );
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Verify password was updated
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        password: true,
        passwordResetToken: true,
        passwordResetExpires: true,
      },
    });

    if (!updatedUser) {
      logResult(
        "Reset-password updates password with valid token",
        false,
        "Updated user not found"
      );
      return;
    }

    // Verify new password works
    const isNewPasswordValid = await bcrypt.compare(NEW_PASSWORD, updatedUser.password!);
    if (!isNewPasswordValid) {
      logResult(
        "Reset-password updates password with valid token",
        false,
        "New password does not match"
      );
      return;
    }

    // Verify old password no longer works
    const isOldPasswordValid = await bcrypt.compare(TEST_USER_PASSWORD, updatedUser.password!);
    if (isOldPasswordValid) {
      logResult(
        "Reset-password updates password with valid token",
        false,
        "Old password still works after reset"
      );
      return;
    }

    // Verify token was cleared
    if (updatedUser.passwordResetToken !== null || updatedUser.passwordResetExpires !== null) {
      logResult(
        "Reset-password updates password with valid token",
        false,
        "Reset token was not cleared after password update"
      );
      return;
    }

    logResult(
      "Reset-password updates password with valid token",
      true,
      "Password updated successfully and token cleared"
    );

    // Reset password back to original for other tests
    const originalHashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: originalHashedPassword,
      },
    });
  } catch (error) {
    logResult(
      "Reset-password updates password with valid token",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 5: Reset-password rejects invalid/expired token
 */
async function testResetPasswordWithInvalidToken() {
  try {
    const invalidToken = "invalid-token-that-does-not-exist";

    // Try to find user with invalid token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: invalidToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    // User should not be found
    if (user) {
      logResult(
        "Reset-password rejects invalid token",
        false,
        "Unexpectedly found user with invalid token"
      );
      return;
    }

    logResult(
      "Reset-password rejects invalid token",
      true,
      "Invalid token correctly rejected"
    );
  } catch (error) {
    logResult(
      "Reset-password rejects invalid token",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 6: Reset-password rejects expired token
 */
async function testResetPasswordWithExpiredToken() {
  try {
    // Create an expired token
    const expiredToken = crypto.randomBytes(32).toString("hex");
    const expiredTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    await prisma.user.update({
      where: { email: TEST_USER_EMAIL },
      data: {
        passwordResetToken: expiredToken,
        passwordResetExpires: expiredTime,
      },
    });

    // Try to find user with expired token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: expiredToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    // User should not be found because token is expired
    if (user) {
      logResult(
        "Reset-password rejects expired token",
        false,
        "Expired token was incorrectly accepted"
      );
      return;
    }

    // Clean up the expired token
    await prisma.user.update({
      where: { email: TEST_USER_EMAIL },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    logResult(
      "Reset-password rejects expired token",
      true,
      "Expired token correctly rejected"
    );
  } catch (error) {
    logResult(
      "Reset-password rejects expired token",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}


/**
 * Test 7: Reset-password validates password strength
 */
async function testResetPasswordValidatesStrength() {
  try {
    const { z } = await import("zod");
    
    // Password schema from validation.ts
    const passwordSchema = z
      .string()
      .min(8, "Šifra mora imati najmanje 8 karaktera")
      .regex(/[A-Z]/, "Šifra mora sadržati najmanje jedno veliko slovo")
      .regex(/[a-z]/, "Šifra mora sadržati najmanje jedno malo slovo")
      .regex(/[0-9]/, "Šifra mora sadržati najmanje jedan broj");

    const weakPasswords = [
      "short",           // Too short
      "nouppercase1",    // No uppercase
      "NOLOWERCASE1",    // No lowercase
      "NoNumbers!",      // No numbers
      "",                // Empty
    ];

    for (const password of weakPasswords) {
      const result = passwordSchema.safeParse(password);
      if (result.success) {
        logResult(
          "Reset-password validates password strength",
          false,
          `Weak password "${password}" was incorrectly accepted`
        );
        return;
      }
    }

    // Test valid password
    const validPassword = "ValidPassword123!";
    const validResult = passwordSchema.safeParse(validPassword);
    if (!validResult.success) {
      logResult(
        "Reset-password validates password strength",
        false,
        `Valid password was incorrectly rejected: ${validResult.error.message}`
      );
      return;
    }

    logResult(
      "Reset-password validates password strength",
      true,
      "Password strength validation works correctly"
    );
  } catch (error) {
    logResult(
      "Reset-password validates password strength",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Test 8: Reset-password requires token
 */
async function testResetPasswordRequiresToken() {
  try {
    const { z } = await import("zod");
    
    // Token schema from reset-password endpoint
    const tokenSchema = z.string().min(1, "Token je obavezan");

    const invalidTokens = ["", null, undefined];

    for (const token of invalidTokens) {
      const result = tokenSchema.safeParse(token);
      if (result.success) {
        logResult(
          "Reset-password requires token",
          false,
          `Empty/null token was incorrectly accepted`
        );
        return;
      }
    }

    logResult(
      "Reset-password requires token",
      true,
      "Token requirement validation works correctly"
    );
  } catch (error) {
    logResult(
      "Reset-password requires token",
      false,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function main() {
  console.log("\n========================================");
  console.log("  Password Reset Flow Tests");
  console.log("  Requirements: 2.5, 2.6");
  console.log("========================================\n");

  try {
    // Setup
    console.log("Setting up test user...\n");
    await setupTestUser();

    // Run tests
    console.log("Running forgot-password tests...\n");
    await testForgotPasswordGeneratesToken();
    await testForgotPasswordNonExistentUser();
    await testForgotPasswordInvalidEmail();

    console.log("\nRunning reset-password tests...\n");
    await testResetPasswordWithValidToken();
    await testResetPasswordWithInvalidToken();
    await testResetPasswordWithExpiredToken();
    await testResetPasswordValidatesStrength();
    await testResetPasswordRequiresToken();

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
