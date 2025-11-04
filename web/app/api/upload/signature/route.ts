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
  } catch (error: any) {
    logger.error("Error generating upload signature", { error: error.message, stack: error.stack });
    
    // Check if it's an auth error
    if (error.message?.includes("Unauthorized") || error.message?.includes("auth")) {
      return NextResponse.json(
        { error: "Morate biti prijavljeni da biste uploadovali slike" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Greška pri pripremi za upload. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

