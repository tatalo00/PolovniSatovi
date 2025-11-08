import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// POST - Submit listing for approval
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { id } = await params;

    // Find listing
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Oglas nije pronađen" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "Nemate dozvolu za slanje ovog oglasa" },
        { status: 403 }
      );
    }

    if (listing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Oglas je već poslat na odobrenje ili je već obrađen" },
        { status: 400 }
      );
    }

    if (!listing.photos || listing.photos.length === 0) {
      return NextResponse.json(
        { error: "Oglas mora imati najmanje jednu fotografiju" },
        { status: 400 }
      );
    }

    // Update listing status to PENDING
    await prisma.listing.update({
      where: { id },
      data: {
        status: "PENDING",
      },
    });

    await prisma.listingStatusAudit.create({
      data: {
        listingId: id,
        userId,
        status: "PENDING",
      },
    });

    logger.info("Listing submitted for approval", { listingId: id, userId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error submitting listing", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}
