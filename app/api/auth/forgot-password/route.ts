import "server-only";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, validateAndSanitize } from "@/lib/validation";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export async function POST(request: Request) {
  // Rate limiting: 5 requests per 15 minutes per IP
  const rateLimitResult = rateLimit(5, 15 * 60 * 1000)(request);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded for forgot password");
    return NextResponse.json(
      { error: "Previše pokušaja. Pokušajte ponovo kasnije." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const validation = validateAndSanitize(forgotPasswordSchema, body);

    if (!validation.success) {
      logger.warn("Forgot password validation failed", { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (user) {
      // Generate reset token
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

      // Send reset email
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        name: user.name || undefined,
        resetToken,
      });

      if (!emailResult.success) {
        // Log email error but don't reveal to user (security)
        logger.error("Failed to send password reset email", { 
          userId: user.id, 
          error: emailResult.error 
        });
        // Still return success to prevent email enumeration
      } else {
        logger.info("Password reset email sent", { userId: user.id });
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "Ako postoji nalog sa tim emailom, poslat će vam se link za resetovanje šifre.",
    });
  } catch (error: any) {
    logger.error("Error in forgot password", { error: error.message });
    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

