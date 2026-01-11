"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const userId = (user as { id: string }).id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });

    return NextResponse.json({
      listingIds: favorites.map((favorite) => favorite.listingId),
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
