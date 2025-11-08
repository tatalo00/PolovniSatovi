"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const userId = (user as { id: string }).id;
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: "asc" },
              take: 1,
            },
            seller: {
              select: {
                name: true,
                email: true,
                locationCity: true,
                locationCountry: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const listings = favorites
      .filter((favorite) => favorite.listing !== null)
      .map((favorite) => ({
        ...favorite.listing,
        favoriteId: favorite.id,
        favoritedAt: favorite.createdAt,
      }));

    return NextResponse.json({
      listings,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Morate biti prijavljeni" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Greška pri učitavanju liste želja" },
      { status: 500 }
    );
  }
}

