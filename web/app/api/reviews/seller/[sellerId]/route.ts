import "server-only";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ sellerId: string }>;
}

// GET - Get all reviews for a seller
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { sellerId } = await params;

    const reviews = await prisma.review.findMany({
      where: { sellerId },
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
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 100) / 100,
      totalReviews: reviews.length,
    });
  } catch (error) {
    logger.error("Error fetching seller reviews", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

