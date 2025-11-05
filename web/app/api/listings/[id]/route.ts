import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const listingUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  brand: z.string().min(2).optional(),
  model: z.string().min(2).optional(),
  reference: z.string().optional(),
  year: z.number().nullable().optional(),
  condition: z.string().min(1).optional(),
  priceEurCents: z.number().int().positive().optional(),
  currency: z.string().optional(),
  boxPapers: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

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

    if (listing.sellerId !== userId && (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nemate dozvolu za izmenu ovog oglasa" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = listingUpdateSchema.safeParse(body);

    if (validation.success == false) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Prepare update data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.reference !== undefined) updateData.reference = data.reference || null;
    if (data.year !== undefined) updateData.year = data.year || null;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.priceEurCents !== undefined) updateData.priceEurCents = data.priceEurCents;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.boxPapers !== undefined) updateData.boxPapers = data.boxPapers || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.location !== undefined) updateData.location = data.location || null;

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
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
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

    await prisma.listing.delete({
      where: { id },
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
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}
