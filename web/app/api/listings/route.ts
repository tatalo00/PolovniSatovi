import "server-only";

import { NextRequest, NextResponse } from "next/server";
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
    const status = searchParams.get("status");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: any = {};

    // Public listings should only show approved ones
    if (status) {
      where.status = status;
    } else {
      where.status = "APPROVED";
    }

    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.priceEurCents = {};
      if (minPrice) {
        where.priceEurCents.gte = parseInt(minPrice) * 100;
      }
      if (maxPrice) {
        where.priceEurCents.lte = parseInt(maxPrice) * 100;
      }
    }

    const listings = await prisma.listing.findMany({
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
      take: 100,
    });

    return NextResponse.json(listings);
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

    if (!validation.success) {
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
