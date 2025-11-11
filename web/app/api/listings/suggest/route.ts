import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const suggestSchema = z.object({
  type: z.enum(["brand", "model"]),
  q: z.string().trim().min(1).max(50),
  brand: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const parsed = suggestSchema.safeParse({
      type: params.get("type"),
      q: params.get("q") ?? "",
      brand: params.get("brand") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Neispravan upit" }, { status: 400 });
    }

    const { type, q, brand } = parsed.data;
    const where: Prisma.ListingWhereInput = {
      status: "APPROVED",
    };
    const detail = params.get("detail") === "1" || params.get("detail") === "true";

    if (type === "brand") {
      where.brand = { contains: q, mode: "insensitive" };

      if (detail) {
        const results = await prisma.listing.groupBy({
          by: ["brand"],
          where,
          _count: { _all: true },
          _avg: { priceEurCents: true },
          _min: { priceEurCents: true },
          orderBy: {
            _count: {
              brand: "desc",
            },
          },
          take: 10,
        });

        return NextResponse.json(
          results
            .filter((row) => row.brand)
            .map((row) => ({
              id: `brand:${row.brand}`,
              label: row.brand!,
              type: "brand" as const,
              avgPriceEurCents: row._avg.priceEurCents,
              listingsCount: row._count._all,
            }))
        );
      }

      const results = await prisma.listing.findMany({
        where,
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
        take: 10,
      });

      return NextResponse.json(results.map((row) => row.brand).filter(Boolean));
    }

    where.model = { contains: q, mode: "insensitive" };
    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    if (detail) {
      const results = await prisma.listing.groupBy({
        by: ["model", "brand"],
        where,
        _count: { _all: true },
        _avg: { priceEurCents: true },
        _min: { priceEurCents: true },
        orderBy: [
          {
            _count: {
              model: "desc",
            },
          },
          {
            _count: {
              brand: "desc",
            },
          },
        ],
        take: 10,
      });

      return NextResponse.json(
        results
          .filter((row) => row.model)
          .map((row) => ({
            id: `model:${row.brand ?? "unknown"}:${row.model}`,
            label: row.model!,
            type: "model" as const,
            secondary: row.brand,
            avgPriceEurCents: row._avg.priceEurCents,
            listingsCount: row._count._all,
          }))
      );
    }

    const results = await prisma.listing.findMany({
      where,
      select: { model: true },
      distinct: ["model"],
      orderBy: { model: "asc" },
      take: 10,
    });

    return NextResponse.json(results.map((row) => row.model).filter(Boolean));
  } catch (error: any) {
    logger.error("Listing suggestion error", { error: error?.message });
    return NextResponse.json(
      { error: "Došlo je do greške pri učitavanju sugestija" },
      { status: 500 }
    );
  }
}

