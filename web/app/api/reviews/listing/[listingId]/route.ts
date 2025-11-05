import "server-only";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ listingId: string }>;
}

// GET - Get all reviews for a listing
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { listingId } = await params;

    const reviews = await prisma.review.findMany({
      where: { listingId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    logger.error("Error fetching listing reviews", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

