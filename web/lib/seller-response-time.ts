import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Compute average seller response time in minutes from message thread data.
 * Looks at the time between buyer's first message and seller's first reply in each thread.
 */
export async function computeSellerResponseTime(
  sellerId: string
): Promise<number | null> {
  try {
    const result = await prisma.$queryRaw<
      { avg_minutes: number | null }[]
    >`
      SELECT AVG(response_minutes)::float as avg_minutes FROM (
        SELECT
          EXTRACT(EPOCH FROM (seller_reply."createdAt" - buyer_msg."createdAt")) / 60 as response_minutes
        FROM "MessageThread" t
        CROSS JOIN LATERAL (
          SELECT "createdAt" FROM "Message"
          WHERE "threadId" = t.id AND "senderId" = t."buyerId"
          ORDER BY "createdAt" ASC LIMIT 1
        ) buyer_msg
        CROSS JOIN LATERAL (
          SELECT "createdAt" FROM "Message"
          WHERE "threadId" = t.id AND "senderId" = t."sellerId" AND "createdAt" > buyer_msg."createdAt"
          ORDER BY "createdAt" ASC LIMIT 1
        ) seller_reply
        WHERE t."sellerId" = ${sellerId}
      ) sub
      WHERE response_minutes > 0
    `;

    return result[0]?.avg_minutes ?? null;
  } catch (error) {
    logger.error("Failed to compute seller response time", {
      sellerId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Compute and update seller's average response time.
 */
export async function updateSellerResponseTime(
  sellerId: string
): Promise<void> {
  const avgMinutes = await computeSellerResponseTime(sellerId);

  if (avgMinutes === null) return;

  try {
    await prisma.sellerProfile.updateMany({
      where: { userId: sellerId },
      data: { avgResponseTimeMinutes: Math.round(avgMinutes) },
    });
  } catch (error) {
    logger.error("Failed to update seller response time", {
      sellerId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Format response time in minutes to a localized Serbian string.
 */
export function formatResponseTime(minutes: number | null | undefined): string | null {
  if (minutes == null) return null;

  if (minutes < 60) return "manje od 1 sata";
  if (minutes < 180) return "do 3 sata";
  if (minutes < 720) return "do 12 sati";
  if (minutes < 1440) return "u toku dana";
  return "u toku nekoliko dana";
}
