import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

/**
 * Get unread message count for a user (cached for 30s).
 * Used in root layout and dashboard layout for badge display.
 */
export function getUnreadMessageCount(userId: string): Promise<number> {
  return unstable_cache(
    async () => {
      try {
        return await prisma.message.count({
          where: {
            thread: {
              OR: [{ buyerId: userId }, { sellerId: userId }],
            },
            senderId: { not: userId },
            readAt: null,
          },
        });
      } catch {
        return 0;
      }
    },
    [`unread-messages-${userId}`],
    {
      tags: [CACHE_TAGS.user(userId), "unread-messages"],
      revalidate: REVALIDATE.INSTANT,
    }
  )();
}
