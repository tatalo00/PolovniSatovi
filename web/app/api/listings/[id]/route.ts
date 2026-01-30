import "server-only";

import { NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { updateSellerSoldCount } from "@/lib/seller-utils";
import { z } from "zod";
import { listingUpdateSchema } from "@/lib/validation/listing";

// GET - Get single listing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
            locationCountry: true,
            createdAt: true,
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

    return NextResponse.json(listing);
  } catch (error: any) {
    logger.error("Error fetching listing", { error: error.message });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

// PATCH - Update listing
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const userRole = (user as any).role;
    const { id } = await params;

    // Check if listing exists and belongs to user
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Oglas nije pronađen" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId && userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Nemate dozvolu za izmenu ovog oglasa" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = listingUpdateSchema
      .extend({
        status: z.nativeEnum(ListingStatus).optional(),
      })
      .safeParse(body);

    if (validation.success == false) {
      const issue = validation.error.issues[0];
      const message =
        issue.code === "invalid_type" && "received" in issue && issue.received === "null"
          ? "Molimo popunite sva obavezna polja"
          : issue.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const data = validation.data;

    // Prepare update data
    const updateData: any = {};
    
    // Generate title from brand and model if brand/model are updated
    if (data.brand !== undefined || data.model !== undefined) {
      const currentBrand = data.brand !== undefined ? data.brand.trim() : listing.brand;
      const currentModel = data.model !== undefined ? data.model.trim() : listing.model;
      updateData.title = `${currentBrand} ${currentModel}`.trim();
    } else if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    
    if (data.brand !== undefined) updateData.brand = data.brand.trim();
    if (data.model !== undefined) updateData.model = data.model.trim();
    if (data.reference !== undefined) updateData.reference = data.reference || null;
    if (data.year !== undefined) updateData.year = data.year || null;
    if (data.caseDiameterMm !== undefined)
      updateData.caseDiameterMm = data.caseDiameterMm || null;
    if (data.caseThicknessMm !== undefined)
      updateData.caseThicknessMm = data.caseThicknessMm || null;
    if (data.caseMaterial !== undefined)
      updateData.caseMaterial = data.caseMaterial?.trim() || null;
    if (data.waterResistanceM !== undefined)
      updateData.waterResistanceM = data.waterResistanceM || null;
    if (data.movement !== undefined)
      updateData.movement = data.movement?.trim() || null;
    if (data.movementType !== undefined)
      updateData.movementType = data.movementType || null;
    if (data.caliber !== undefined)
      updateData.caliber = data.caliber?.trim() || null;
    if (data.dialColor !== undefined)
      updateData.dialColor = data.dialColor || null;
    if (data.dateDisplay !== undefined)
      updateData.dateDisplay = data.dateDisplay || null;
    if (data.bezelType !== undefined)
      updateData.bezelType = data.bezelType || null;
    if (data.bezelMaterial !== undefined)
      updateData.bezelMaterial = data.bezelMaterial?.trim() || null;
    if (data.strapType !== undefined)
      updateData.strapType = data.strapType || null;
    if (data.braceletMaterial !== undefined)
      updateData.braceletMaterial = data.braceletMaterial?.trim() || null;
    if (data.strapWidthMm !== undefined)
      updateData.strapWidthMm = data.strapWidthMm || null;
    if (data.warranty !== undefined)
      updateData.warranty = data.warranty || null;
    if (data.warrantyCard !== undefined)
      updateData.warrantyCard = data.warrantyCard ?? null;
    if (data.originalOwner !== undefined)
      updateData.originalOwner = data.originalOwner ?? null;
    if (data.runningCondition !== undefined)
      updateData.runningCondition = data.runningCondition || null;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.priceEurCents !== undefined) updateData.priceEurCents = data.priceEurCents;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.boxPapers !== undefined) updateData.boxPapers = data.boxPapers || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.location !== undefined) updateData.location = data.location || null;

    if (data.status !== undefined) {
      const allowedStatuses =
        userRole === "ADMIN"
          ? Object.values(ListingStatus)
          : [ListingStatus.APPROVED, ListingStatus.SOLD];

      if (!allowedStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: "Nedozvoljena promena statusa" },
          { status: 400 }
        );
      }

      if (
        userRole !== "ADMIN" &&
        data.status === ListingStatus.SOLD &&
        listing.status !== ListingStatus.APPROVED
      ) {
        return NextResponse.json(
          { error: "Oglas se može označiti kao prodat samo ako je prethodno bio aktivan" },
          { status: 400 }
        );
      }

      if (
        userRole !== "ADMIN" &&
        data.status === ListingStatus.APPROVED &&
        listing.status !== ListingStatus.SOLD
      ) {
        return NextResponse.json(
          { error: "Oglas se može ponovo aktivirati samo ako je prethodno bio označen kao prodat" },
          { status: 400 }
        );
      }

      if (listing.status !== data.status) {
        updateData.status = data.status;
        await prisma.listingStatusAudit.create({
          data: {
            listingId: id,
            userId,
            status: data.status,
          },
        });
      }
    }

    // Update photos if provided
    if (data.photos !== undefined) {
      // Delete existing photos
      await prisma.listingPhoto.deleteMany({
        where: { listingId: id },
      });

      // Create new photos
      updateData.photos = {
        create: data.photos.map((url: string, index: number) => ({
          url,
          order: index,
        })),
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(listing);
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update seller sold count when status changes to/from SOLD
    if (
      updateData.status &&
      (updateData.status === ListingStatus.SOLD || listing.status === ListingStatus.SOLD)
    ) {
      updateSellerSoldCount(listing.sellerId).catch((err) =>
        logger.error("Failed to update sold count", { error: String(err) })
      );
    }

    logger.info("Listing updated", { listingId: id, userId });

    return NextResponse.json(updatedListing);
  } catch (error: any) {
    logger.error("Error updating listing", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      const message =
        issue.code === "invalid_type" && "received" in issue && issue.received === "null"
          ? "Molimo popunite sva obavezna polja"
          : issue.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Došlo je do greške pri ažuriranju oglasa" },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { id } = await params;

    // Check if listing exists and belongs to user
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Oglas nije pronađen" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId && (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nemate dozvolu za brisanje ovog oglasa" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.listingPhoto.deleteMany({ where: { listingId: id } });
      await tx.listingStatusAudit.deleteMany({ where: { listingId: id } });
      await tx.listing.delete({ where: { id } });
    });

    logger.info("Listing deleted", { listingId: id, userId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting listing", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Došlo je do greške pri brisanju oglasa" },
      { status: 500 }
    );
  }
}
