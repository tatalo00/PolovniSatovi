"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { SellerApplicationStatus, SellerType } from "@prisma/client";

const applicationSchema = z
  .object({
    storeName: z.string().min(2, "Naziv prodavnice mora imati najmanje 2 karaktera"),
    sellerType: z.nativeEnum(SellerType),
    shortDescription: z
      .string()
      .min(10, "Napišite bar 10 karaktera")
      .max(320, "Kratak opis može imati najviše 320 karaktera"),
    locationCountry: z.string().min(2, "Unesite državu"),
    locationCity: z.string().min(2, "Unesite grad"),
    instagramHandle: z.string().optional(),
    proofUrl: z.string().url("Link mora biti validan URL").optional(),
  })
  .refine(
    (data) => {
      const hasInstagram = data.instagramHandle?.trim().length;
      return hasInstagram || data.proofUrl;
    },
    {
      message: "Unesite Instagram profil ili otpremite fotografiju",
      path: ["instagramHandle"],
    }
  );

type AuthedUser = { id: string };

function normalize(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET() {
  try {
    const { id: userId } = (await requireAuth()) as AuthedUser;

    const application = await prisma.sellerApplication.findUnique({
      where: { userId },
    });

    if (!application) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    logger.error("Failed to fetch seller application", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Došlo je do greške" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id: userId } = (await requireAuth()) as AuthedUser;
    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Neispravni podaci" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const application = await prisma.sellerApplication.upsert({
      where: { userId },
      create: {
        userId,
        sellerType: data.sellerType,
        storeName: data.storeName.trim(),
        shortDescription: data.shortDescription.trim(),
        locationCountry: data.locationCountry.trim(),
        locationCity: data.locationCity.trim(),
        instagramHandle: normalize(data.instagramHandle),
        proofUrl: normalize(data.proofUrl),
        status: SellerApplicationStatus.PENDING,
      },
      update: {
        sellerType: data.sellerType,
        storeName: data.storeName.trim(),
        shortDescription: data.shortDescription.trim(),
        locationCountry: data.locationCountry.trim(),
        locationCity: data.locationCity.trim(),
        instagramHandle: normalize(data.instagramHandle),
        proofUrl: normalize(data.proofUrl),
        status: SellerApplicationStatus.PENDING,
      },
    });

    logger.info("Seller application submitted", { userId });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    logger.error("Failed to submit seller application", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Došlo je do greške prilikom slanja prijave" },
      { status: 500 }
    );
  }
}

