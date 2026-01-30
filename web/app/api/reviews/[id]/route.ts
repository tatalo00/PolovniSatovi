import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { updateSellerRating } from "@/lib/seller-utils";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional().nullable(),
  comment: z.string().max(2000).optional().nullable(),
});

// PATCH - Update a review
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { id } = await params;
    const body = await request.json();
    const data = updateReviewSchema.parse(body);

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
      select: { reviewerId: true, sellerId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Ocena nije pronađena" },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.reviewerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update seller's average rating
    await updateSellerRating(review.sellerId);

    return NextResponse.json(updatedReview);
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
    logger.error("Error updating review", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { id } = await params;

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
      select: { reviewerId: true, sellerId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Ocena nije pronađena" },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.reviewerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    });

    // Update seller's average rating
    await updateSellerRating(review.sellerId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    logger.error("Error deleting review", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}


