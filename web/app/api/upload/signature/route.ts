import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSignedUploadParams } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    await requireAuth();

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      logger.error("Cloudinary environment variables not configured");
      return NextResponse.json(
        { error: "Cloudinary nije konfigurisan. Molimo kontaktirajte administratora." },
        { status: 500 }
      );
    }

    const { folder } = await request.json().catch(() => ({}));

    const params = getSignedUploadParams(folder || "listings");

    return NextResponse.json(params);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    const errStack = error instanceof Error ? error.stack : undefined;
    logger.error("Error generating upload signature", { error: errMessage, stack: errStack });
    
    // Check if it's an auth error
    if (errMessage?.includes("Unauthorized") || errMessage?.includes("auth")) {
      return NextResponse.json(
        { error: "Morate biti prijavljeni da biste uploadovali slike" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: errMessage || "Greška pri pripremi za upload. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

