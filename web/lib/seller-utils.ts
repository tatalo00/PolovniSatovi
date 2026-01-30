import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Recalculate and update seller's average rating and review count.
 * Called after review create/update/delete operations.
 */
export async function updateSellerRating(sellerId: string) {
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: sellerId },
    select: { id: true },
  });

  if (!sellerProfile) {
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { sellerId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.sellerProfile.update({
      where: { userId: sellerId },
      data: { ratingAvg: null, reviewCount: 0 },
    });
    return;
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const roundedAvg = Math.round(avgRating * 100) / 100;

  await prisma.sellerProfile.update({
    where: { userId: sellerId },
    data: { ratingAvg: roundedAvg, reviewCount: reviews.length },
  });
}

/**
 * Recalculate and update seller's total sold count.
 * Called when listing status changes to/from SOLD.
 */
export async function updateSellerSoldCount(sellerId: string) {
  try {
    const soldCount = await prisma.listing.count({
      where: { sellerId, status: "SOLD" },
    });

    await prisma.sellerProfile.updateMany({
      where: { userId: sellerId },
      data: { totalSoldCount: soldCount },
    });
  } catch (error) {
    logger.error("Failed to update seller sold count", {
      sellerId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
