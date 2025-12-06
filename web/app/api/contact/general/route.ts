import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { sendGeneralContactEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, validateAndSanitize } from "@/lib/validation";

const SUBJECT_OPTIONS = ["general", "technical", "partnership", "other"] as const;

const generalContactSchema = z.object({
  name: z
    .string()
    .min(2, "Ime i prezime mora imati najmanje 2 karaktera")
    .max(100, "Ime i prezime ne može biti duže od 100 karaktera"),
  email: emailSchema,
  subject: z.enum(SUBJECT_OPTIONS),
  message: z
    .string()
    .min(10, "Poruka mora imati najmanje 10 karaktera")
    .max(2000, "Poruka ne može biti duža od 2000 karaktera"),
});

export async function POST(request: Request) {
  const rateLimitResult = rateLimit(10, 15 * 60 * 1000)(request);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded for general contact form");
    return NextResponse.json(
      { error: "Previše poruka. Pokušajte ponovo kasnije." },
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
    const validation = validateAndSanitize(generalContactSchema, body);

    if (validation.success === false) {
      logger.warn("General contact form validation failed", { error: validation.error });
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, subject, message } = validation.data;
    const result = await sendGeneralContactEmail({
      name,
      email,
      subject,
      message,
    });

    if (!result.success) {
      logger.error("Failed to send general contact email", { name, email, subject });
      return NextResponse.json(
        { error: "Došlo je do greške pri slanju poruke." },
        { status: 500 }
      );
    }

    logger.info("General contact email sent successfully", { name, email, subject });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error handling general contact form", { error: error?.message });
    return NextResponse.json(
      { error: "Došlo je do neočekivane greške. Pokušajte ponovo kasnije." },
      { status: 500 }
    );
  }
}

