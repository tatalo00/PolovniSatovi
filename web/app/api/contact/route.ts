import "server-only";

import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, validateAndSanitize } from "@/lib/validation";
import { z } from "zod";

const contactSchema = z.object({
  listingId: z.string().min(1, "Listing ID je obavezan"),
  listingTitle: z.string().min(1, "Naslov oglasa je obavezan"),
  sellerEmail: emailSchema,
  buyerEmail: emailSchema,
  buyerName: z.string().optional(),
  message: z.string().min(10, "Poruka mora imati najmanje 10 karaktera").max(1000, "Poruka ne može biti duža od 1000 karaktera"),
});

export async function POST(request: Request) {
  // Rate limiting: 10 contact messages per 15 minutes per IP
  const rateLimitResult = await rateLimit(10, 15 * 60 * 1000)(request);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded for contact form");
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
    const validation = validateAndSanitize(contactSchema, body);

    if (validation.success == false) {
      logger.warn("Contact form validation failed", { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { listingId, listingTitle, sellerEmail, buyerName, buyerEmail, message } = validation.data;

    // Send email to seller
    const result = await sendContactEmail({
      to: sellerEmail,
      listingTitle,
      listingId,
      buyerName,
      buyerEmail,
      message,
    });

    if (!result.success) {
      logger.error("Failed to send contact email", { listingId, sellerEmail, buyerEmail });
      return NextResponse.json(
        { error: "Došlo je do greške pri slanju emaila" },
        { status: 500 }
      );
    }

    logger.info("Contact email sent successfully", { listingId, sellerEmail, buyerEmail });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error sending contact message", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}

