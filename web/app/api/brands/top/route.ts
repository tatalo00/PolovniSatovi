import "server-only";

import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getTopBrandsByGender } from "@/lib/brands-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topBrands = await getTopBrandsByGender(10);
    return NextResponse.json(topBrands);
  } catch (error) {
    logger.error("Failed to load top brands by gender", {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      { error: "Došlo je do greške pri učitavanju brendova" },
      { status: 500 }
    );
  }
}


