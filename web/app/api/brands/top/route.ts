import "server-only";

import { logger } from "@/lib/logger";
import { getTopBrandsByGender } from "@/lib/brands-server";
import { jsonWithCache, errorResponse, CACHE_CONTROL } from "@/lib/api-utils";

// Allow caching at CDN level
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const topBrands = await getTopBrandsByGender(10);

    // Brands don't change often - cache for 1 hour
    return jsonWithCache(topBrands, { cache: CACHE_CONTROL.LONG });
  } catch (error) {
    logger.error("Failed to load top brands by gender", {
      error: error instanceof Error ? error.message : error,
    });
    return errorResponse("Došlo je do greške pri učitavanju brendova", 500);
  }
}
