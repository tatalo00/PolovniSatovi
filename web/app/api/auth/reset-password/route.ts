import "server-only";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { passwordSchema, validateAndSanitize } from "@/lib/validation";
import { z } from "zod";
import bcrypt from "bcryptjs";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token je obavezan"),
  password: passwordSchema,
});

export async function POST(request: Request) {
  // Rate limiting: 5 requests per 15 minutes per IP
  const rateLimitResult = rateLimit(5, 15 * 60 * 1000)(request);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded for reset password");
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
    const validation = validateAndSanitize(resetPasswordSchema, body);

    if (validation.success === false) {
      const { error } = validation;
      logger.warn("Reset password validation failed", { error });
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token je neispravan ili je istekao. Molimo zatražite novi link za resetovanje." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    logger.info("Password reset successfully", { userId: user.id });

    return NextResponse.json({
      success: true,
      message: "Šifra je uspešno promenjena. Možete se sada prijaviti.",
    });
  } catch (error: any) {
    logger.error("Error resetting password", { error: error.message });
    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

