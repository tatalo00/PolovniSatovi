import "server-only";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { SellerApplicationStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Find the application
    const application = await prisma.sellerApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Prijava nije pronađena" }, { status: 404 });
    }

    if (application.status === SellerApplicationStatus.APPROVED) {
      return NextResponse.json({ error: "Prijava je već odobrena" }, { status: 400 });
    }

    // Update application status
    await prisma.sellerApplication.update({
      where: { id },
      data: {
        status: SellerApplicationStatus.APPROVED,
      },
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: application.userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Create or update seller profile
    await prisma.sellerProfile.upsert({
      where: { userId: application.userId },
      update: {
        storeName: application.storeName,
        shortDescription: application.shortDescription,
        locationCountry: application.locationCountry,
        locationCity: application.locationCity,
      },
      create: {
        userId: application.userId,
        storeName: application.storeName,
        shortDescription: application.shortDescription,
        locationCountry: application.locationCountry,
        locationCity: application.locationCity,
      },
    });

    logger.info("Seller application approved", {
      applicationId: id,
      userId: application.userId,
    });

    // Invalidate cache for listings to show updated verified status
    revalidatePath("/listings");
    revalidatePath("/");
    revalidatePath(`/sellers/${application.userId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error approving seller application", {
      error: error.message,
      stack: error.stack,
    });

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Nemate dozvolu" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

