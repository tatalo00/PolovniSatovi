import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildWhereClause,
  normalizeSearchParams,
  type IncomingSearchParams,
} from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const params: IncomingSearchParams = {
      brand: sp.get("brand") ?? undefined,
      model: sp.get("model") ?? undefined,
      reference: sp.get("reference") ?? undefined,
      min: sp.get("min") ?? sp.get("minPrice") ?? undefined,
      max: sp.get("max") ?? sp.get("maxPrice") ?? undefined,
      year: sp.get("year") ?? undefined,
      yearFrom: sp.get("yearFrom") ?? undefined,
      yearTo: sp.get("yearTo") ?? undefined,
      cond: sp.get("cond") ?? sp.get("condition") ?? undefined,
      movement: sp.get("movement") ?? undefined,
      loc: sp.get("loc") ?? sp.get("location") ?? undefined,
      gender: sp.get("gender") ?? undefined,
      box: sp.get("box") ?? undefined,
      verified: sp.get("verified") ?? undefined,
      authenticated: sp.get("authenticated") ?? undefined,
    };

    const normalized = normalizeSearchParams(params);
    const where = buildWhereClause(normalized);

    const [conditionFacets, movementFacets, genderFacets] = await Promise.all([
      prisma.listing.groupBy({
        by: ["condition"],
        where,
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["movement"],
        where,
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["gender"],
        where,
        _count: { _all: true },
      }),
    ]);

    const response = NextResponse.json({
      condition: Object.fromEntries(
        conditionFacets
          .filter((f) => f.condition)
          .map((f) => [f.condition, f._count._all])
      ),
      movement: Object.fromEntries(
        movementFacets
          .filter((f) => f.movement)
          .map((f) => [f.movement!, f._count._all])
      ),
      gender: Object.fromEntries(
        genderFacets
          .filter((f) => f.gender)
          .map((f) => [f.gender, f._count._all])
      ),
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    return response;
  } catch (error) {
    console.error("Facet query error:", error);
    return NextResponse.json(
      { error: "Failed to load facets" },
      { status: 500 }
    );
  }
}
