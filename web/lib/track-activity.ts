import "server-only";

import { prisma } from "@/lib/prisma";

const ACTIVITY_DEBOUNCE_MS = 60 * 1000; // 1 minute debounce

// Cache to avoid excessive DB writes
const lastUpdateCache = new Map<string, number>();

/**
 * Update user's lastSeenAt timestamp for email notification purposes.
 * Debounced to avoid excessive DB writes (max once per minute per user).
 */
export async function trackUserActivity(userId: string): Promise<void> {
  const now = Date.now();
  const lastUpdate = lastUpdateCache.get(userId) || 0;

  // Skip if we updated within the last minute
  if (now - lastUpdate < ACTIVITY_DEBOUNCE_MS) {
    return;
  }

  // Update cache immediately to prevent race conditions
  lastUpdateCache.set(userId, now);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  } catch (error) {
    // Log but don't throw - activity tracking should never break the request
    console.error("Failed to update user activity:", error);
    // Remove from cache on failure so we retry next time
    lastUpdateCache.delete(userId);
  }
}
