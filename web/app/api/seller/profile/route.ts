import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

type AuthedUser = { id: string };

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalUrlSchema = z
  .string()
  .url("Neispravan URL format")
  .max(2048, "URL je predugačak")
  .optional()
  .or(z.literal(""));

const sellerProfileSchema = z.object({
  storeName: z.string().min(2, "Naziv prodavnice mora imati najmanje 2 karaktera"),
  slug: z
    .string()
    .min(3, "Slug mora imati najmanje 3 karaktera")
    .max(60, "Slug ne može biti duži od 60 karaktera")
    .regex(SLUG_REGEX, "Slug može sadržati samo mala slova, brojeve i crtice")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(320, "Kratak opis može imati najviše 320 karaktera")
    .optional()
    .or(z.literal("")),
  locationCountry: z.string().min(2, "Unesite državu"),
  locationCity: z.string().min(2, "Unesite grad"),
  logoUrl: optionalUrlSchema.optional(),
  heroImageUrl: optionalUrlSchema.optional(),
});

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);

async function ensureUniqueSlug(base: string, excludeUserId?: string) {
  if (!base) {
    base = "seller";
  }

  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.sellerProfile.findFirst({
      where: {
        slug: candidate,
        ...(excludeUserId ? { NOT: { userId: excludeUserId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

function normalizeOptional(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function resolveSlug({
  requestedSlug,
  storeName,
  userId,
  existingSlug,
}: {
  requestedSlug?: string | null;
  storeName: string;
  userId: string;
  existingSlug?: string | null;
}) {
  const trimmedRequest = requestedSlug?.trim();

  if (!trimmedRequest && existingSlug) {
    return existingSlug;
  }

  const baseSource = trimmedRequest ?? storeName;
  let base = slugify(baseSource);

  if (!base) {
    base = `seller-${userId.slice(0, 6)}`;
  }

  if (existingSlug && base === existingSlug) {
    return existingSlug;
  }

  return ensureUniqueSlug(base, userId);
}

// GET - Get seller profile
export async function GET() {
  try {
    const { id: userId } = (await requireAuth()) as AuthedUser;

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    logger.error("Error fetching seller profile", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.message === "Unauthorized") {
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
    const { id: userId } = (await requireAuth()) as AuthedUser;

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

    if (validation.success == false) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const slug = await resolveSlug({
      requestedSlug: data.slug,
      storeName: data.storeName,
      userId,
    });

    const profile = await prisma.sellerProfile.create({
      data: {
        userId,
        storeName: data.storeName.trim(),
        slug,
        description: normalizeOptional(data.description),
        shortDescription: normalizeOptional(data.shortDescription),
        locationCountry: data.locationCountry.trim(),
        locationCity: data.locationCity.trim(),
        logoUrl: normalizeOptional(data.logoUrl),
        heroImageUrl: normalizeOptional(data.heroImageUrl),
      },
    });

    logger.info("Seller profile created", { userId });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    logger.error("Error creating seller profile", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Došlo je do greške pri kreiranju profila" },
      { status: 500 }
    );
  }
}

// PATCH - Update seller profile
export async function PATCH(request: Request) {
  try {
    const { id: userId } = (await requireAuth()) as AuthedUser;

    const body = await request.json();
    const validation = sellerProfileSchema.safeParse(body);

    if (validation.success == false) {
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

    const slug = await resolveSlug({
      requestedSlug: data.slug,
      storeName: data.storeName,
      userId,
      existingSlug: existing.slug,
    });

    const profile = await prisma.sellerProfile.update({
      where: { userId },
      data: {
        storeName: data.storeName.trim(),
        slug,
        description: normalizeOptional(data.description),
        shortDescription: normalizeOptional(data.shortDescription),
        locationCountry: data.locationCountry.trim(),
        locationCity: data.locationCity.trim(),
        logoUrl: normalizeOptional(data.logoUrl),
        heroImageUrl: normalizeOptional(data.heroImageUrl),
      },
    });

    logger.info("Seller profile updated", { userId });

    return NextResponse.json(profile);
  } catch (error) {
    logger.error("Error updating seller profile", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Došlo je do greške pri ažuriranju profila" },
      { status: 500 }
    );
  }
}
