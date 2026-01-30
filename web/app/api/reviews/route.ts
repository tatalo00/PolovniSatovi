import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { updateSellerRating } from "@/lib/seller-utils";
import { z } from "zod";

const createReviewSchema = z.object({
  listingId: z.string().optional(),
  sellerId: z.string().min(1, "Seller ID je obavezan"),
  rating: z.number().int().min(1, "Ocena mora biti između 1 i 5").max(5, "Ocena mora biti između 1 i 5"),
  title: z.string().max(100, "Naslov je predugačak").optional(),
  comment: z.string().max(2000, "Komentar je predugačak").optional(),
});

// POST - Create a review
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const body = await request.json();
    const { listingId, sellerId, rating, title, comment } = createReviewSchema.parse(body);

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return NextResponse.json(
        { error: "Prodavac nije pronađen" },
        { status: 404 }
      );
    }

    // Prevent self-review
    if (sellerId === userId) {
      return NextResponse.json(
        { error: "Ne možete oceniti samog sebe" },
        { status: 400 }
      );
    }

    // If listingId is provided, verify it exists and belongs to the seller
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { sellerId: true, status: true },
      });

      if (!listing) {
        return NextResponse.json(
          { error: "Oglas nije pronađen" },
          { status: 404 }
        );
      }

      if (listing.sellerId !== sellerId) {
        return NextResponse.json(
          { error: "Oglas ne pripada ovom prodavcu" },
          { status: 400 }
        );
      }

      // Check if review already exists for this listing
      const existingReview = await prisma.review.findUnique({
        where: {
          reviewerId_listingId: {
            reviewerId: userId,
            listingId,
          },
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "Već ste ocenili ovaj oglas" },
          { status: 400 }
        );
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        listingId,
        sellerId,
        reviewerId: userId,
        rating,
        title,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        listing: listingId
          ? {
              select: {
                id: true,
                title: true,
              },
            }
          : undefined,
      },
    });

    // Update seller's average rating
    await updateSellerRating(sellerId);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Već ste ocenili ovog prodavca za ovaj oglas" },
        { status: 400 }
      );
    }
    logger.error("Error creating review", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}


