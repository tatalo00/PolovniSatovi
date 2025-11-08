import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const listingCreateSchema = z.object({
  title: z.string().min(5, "Naziv mora imati najmanje 5 karaktera"),
  brand: z.string().min(2, "Marka je obavezna"),
  model: z.string().min(2, "Model je obavezan"),
  reference: z.string().optional(),
  year: z.number().nullable().optional(),
  caseDiameterMm: z.number().int().positive().nullable().optional(),
  caseMaterial: z.string().optional(),
  movement: z.string().optional(),
  condition: z.string().min(1, "Stanje je obavezno"),
  priceEurCents: z.number().int().positive("Cena mora biti pozitivan broj"),
  currency: z.string().default("EUR"),
  boxPapers: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  photos: z.array(z.string()).min(0),
});

// GET - List all listings (with filters for approved only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") ?? "APPROVED";
    const q = searchParams.get("q") ?? searchParams.get("search") ?? undefined;
    const brand = searchParams.get("brand") ?? undefined;
    const model = searchParams.get("model") ?? undefined;
    const cond = searchParams.get("cond") ?? searchParams.get("condition") ?? undefined;
    const min = searchParams.get("min") ?? searchParams.get("minPrice") ?? undefined;
    const max = searchParams.get("max") ?? searchParams.get("maxPrice") ?? undefined;
    const year = searchParams.get("year") ?? undefined;
    const loc = searchParams.get("loc") ?? searchParams.get("location") ?? undefined;
    const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
    const limitParam = parseInt(searchParams.get("limit") ?? "20", 10);

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limitCandidate = Number.isNaN(limitParam) ? 20 : limitParam;
    const limit = Math.min(Math.max(limitCandidate, 1), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      status,
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
      ];
    }

    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    if (model) {
      where.model = { contains: model, mode: "insensitive" };
    }

    if (cond) {
      where.condition = cond;
    }

    if (min || max) {
      where.priceEurCents = {};

      if (min) {
        const minValue = parseInt(min, 10);
        if (!Number.isNaN(minValue)) {
          where.priceEurCents.gte = minValue * 100;
        }
      }

      if (max) {
        const maxValue = parseInt(max, 10);
        if (!Number.isNaN(maxValue)) {
          where.priceEurCents.lte = maxValue * 100;
        }
      }
    }

    if (year) {
      const yearValue = parseInt(year, 10);
      if (!Number.isNaN(yearValue)) {
        where.year = yearValue;
      }
    }

    if (loc) {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { location: { contains: loc, mode: "insensitive" } },
            { seller: { locationCity: { contains: loc, mode: "insensitive" } } },
            { seller: { locationCountry: { contains: loc, mode: "insensitive" } } },
          ],
        },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          photos: {
            orderBy: { order: "asc" },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              locationCity: true,
              locationCountry: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching listings", { error: error.message });
    return NextResponse.json(
      { error: "Došlo je do greške pri učitavanju oglasa" },
      { status: 500 }
    );
  }
}

// POST - Create new listing
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    const body = await request.json();
    const validation = listingCreateSchema.safeParse(body);

    if (validation.success == false) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create listing with photos
    const listing = await prisma.listing.create({
      data: {
        sellerId: userId,
        title: data.title,
        brand: data.brand,
        model: data.model,
        reference: data.reference || null,
        year: data.year || null,
        caseDiameterMm: data.caseDiameterMm || null,
        caseMaterial: data.caseMaterial?.trim() || null,
        movement: data.movement?.trim() || null,
        condition: data.condition,
        priceEurCents: data.priceEurCents,
        currency: data.currency || "EUR",
        boxPapers: data.boxPapers || null,
        description: data.description || null,
        location: data.location || null,
        status: "DRAFT",
        photos: {
          create: data.photos.map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        photos: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info("Listing created", { listingId: listing.id, userId });

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    logger.error("Error creating listing:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Došlo je do greške pri kreiranju oglasa" },
      { status: 500 }
    );
  }
}
