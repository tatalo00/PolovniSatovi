import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const sellerProfileSchema = z.object({
  storeName: z.string().min(2, "Naziv prodavnice mora imati najmanje 2 karaktera"),
  description: z.string().optional(),
  locationCountry: z.string().min(2, "Unesite državu"),
  locationCity: z.string().min(2, "Unesite grad"),
});

// GET - Get seller profile
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    logger.error("Error fetching seller profile", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

// POST - Create seller profile
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    // Check if profile already exists
    const existing = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Profil već postoji. Koristite PATCH za ažuriranje." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = sellerProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    const profile = await prisma.sellerProfile.create({
      data: {
        userId,
        storeName: data.storeName,
        description: data.description || null,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
      },
    });

    logger.info("Seller profile created", { userId });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    logger.error("Error creating seller profile", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}

// PATCH - Update seller profile
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    const body = await request.json();
    const validation = sellerProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if profile exists
    const existing = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Profil ne postoji. Koristite POST za kreiranje." },
        { status: 404 }
      );
    }

    const profile = await prisma.sellerProfile.update({
      where: { userId },
      data: {
        storeName: data.storeName,
        description: data.description || null,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
      },
    });

    logger.info("Seller profile updated", { userId });

    return NextResponse.json(profile);
  } catch (error: any) {
    logger.error("Error updating seller profile", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}
