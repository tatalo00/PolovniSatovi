import "server-only";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { sendListingStatusEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Find listing
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Oglas nije pronađen" },
        { status: 404 }
      );
    }

    if (listing.status !== "PENDING") {
      return NextResponse.json(
        { error: "Oglas je već obrađen" },
        { status: 400 }
      );
    }

    // Update listing status
    await prisma.listing.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    await prisma.listingStatusAudit.create({
      data: {
        listingId: id,
        userId: (admin as any).id,
        status: "REJECTED",
      },
    });

    // Send email notification
    const emailResult = await sendListingStatusEmail({
      to: listing.seller.email,
      listingTitle: listing.title,
      status: "REJECTED",
      reason: reason || undefined,
    });

    if (!emailResult.success) {
      logger.error("Failed to send rejection email", {
        listingId: id,
        error: emailResult.error,
      });
    }

    logger.info("Listing rejected", { listingId: id, reason });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error rejecting listing", {
      error: error.message,
      stack: error.stack,
    });

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Nemate dozvolu za ovu akciju" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
