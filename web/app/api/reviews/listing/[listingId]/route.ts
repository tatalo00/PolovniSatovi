import "server-only";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { jsonWithCache, errorResponse, CACHE_CONTROL } from "@/lib/api-utils";

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

    // Reviews are public data - cache for 5 minutes
    return jsonWithCache(reviews, { cache: CACHE_CONTROL.SHORT });
  } catch (error) {
    logger.error("Error fetching listing reviews", { error });
    return errorResponse("Došlo je do greške", 500);
  }
}
