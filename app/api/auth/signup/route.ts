import "server-only";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, passwordSchema, nameSchema, validateAndSanitize } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
});

export async function POST(request: Request) {
  // Rate limiting: 5 signups per 15 minutes per IP
  const rateLimitResult = rateLimit(5, 15 * 60 * 1000)(request);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded for signup", {
      identifier: request.headers.get("x-forwarded-for") || "unknown",
    });
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
    const validation = validateAndSanitize(signupSchema, body);

    if (!validation.success) {
      logger.warn("Signup validation failed", { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn("Signup attempt with existing email", { email });
      return NextResponse.json(
        { error: "Korisnik sa ovim emailom već postoji" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: "BUYER",
      },
    });

    logger.info("User created successfully", { userId: user.id, email });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Signup error", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

