import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { Gender, ListingStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { listingCreateSchema } from "@/lib/validation/listing";

// GET - List all listings (with filters for approved only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawStatus = searchParams.get("status");

    const isListingStatus = (value: string): value is ListingStatus => {
      return Object.values(ListingStatus).includes(value as ListingStatus);
    };

    const status: ListingStatus =
      rawStatus && isListingStatus(rawStatus)
        ? rawStatus
        : ListingStatus.APPROVED;
    const q = searchParams.get("q") ?? searchParams.get("search") ?? undefined;
    const brand = searchParams.get("brand") ?? undefined;
    const model = searchParams.get("model") ?? undefined;
    const cond = searchParams.get("cond") ?? searchParams.get("condition") ?? undefined;
    const min = searchParams.get("min") ?? searchParams.get("minPrice") ?? undefined;
    const max = searchParams.get("max") ?? searchParams.get("maxPrice") ?? undefined;
    const year = searchParams.get("year") ?? undefined;
    const movement = searchParams.get("movement") ?? undefined;
    const loc = searchParams.get("loc") ?? searchParams.get("location") ?? undefined;
    const box = searchParams.get("box") ?? undefined;
    const verified = searchParams.get("verified") ?? undefined;
    const genderParam = searchParams.get("gender") ?? undefined;
    const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
    const limitParam = parseInt(searchParams.get("limit") ?? "20", 10);

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limitCandidate = Number.isNaN(limitParam) ? 20 : limitParam;
    const limit = Math.min(Math.max(limitCandidate, 1), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      status: { equals: status },
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

    if (movement) {
      where.movement = { contains: movement, mode: "insensitive" };
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
      const existingAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
        ? [where.AND]
        : [];

      where.AND = [
        ...existingAnd,
        {
          OR: [
            { location: { contains: loc, mode: "insensitive" } },
            { seller: { locationCity: { contains: loc, mode: "insensitive" } } },
            { seller: { locationCountry: { contains: loc, mode: "insensitive" } } },
          ],
        },
      ];
    }

    if (genderParam) {
      const normalizedGender = genderParam.trim().toUpperCase();
      if (normalizedGender === Gender.MALE || normalizedGender === Gender.FEMALE) {
        where.gender = { in: [normalizedGender as Gender, Gender.UNISEX] };
      } else if (normalizedGender === Gender.UNISEX) {
        where.gender = { equals: Gender.UNISEX };
      }
    }

    if (box) {
      const normalizedBox = box.trim().toLowerCase();
      if (normalizedBox === "full") {
        where.boxPapers = { not: null };
      }
    }

    if (verified) {
      const normalizedVerified = verified.trim().toLowerCase();
      if (["1", "true", "yes"].includes(normalizedVerified)) {
        const existingAnd = Array.isArray(where.AND)
          ? where.AND
          : where.AND
          ? [where.AND]
          : [];
        where.AND = [
          ...existingAnd,
          {
            seller: {
              isVerified: true,
            },
          },
        ];
      }
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error fetching listings", { error: message });
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
    const userId = user.id;

    const body = await request.json();
    const validation = listingCreateSchema.safeParse(body);

    if (validation.success == false) {
      const issue = validation.error.issues[0];
      const message =
        issue.code === "invalid_type" && "received" in issue && issue.received === "null"
          ? "Molimo popunite sva obavezna polja"
          : issue.message;
      return NextResponse.json({ error: message }, { status: 400 });
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
        gender: data.gender,
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
  } catch (error: unknown) {
    const errorContext =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error };
    logger.error("Error creating listing:", errorContext);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      const message =
        issue.code === "invalid_type" && "received" in issue && issue.received === "null"
          ? "Molimo popunite sva obavezna polja"
          : issue.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Došlo je do greške pri kreiranju oglasa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
