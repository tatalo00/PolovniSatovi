"use server";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ listingId: string }>;
}

export async function POST(_: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { listingId } = await params;
    const userId = (user as { id: string }).id;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Oglas nije pronađen" }, { status: 404 });
    }

    try {
      await prisma.favorite.create({
        data: {
          userId,
          listingId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Morate biti prijavljeni" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Greška pri dodavanju u listu želja" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { listingId } = await params;
    const userId = (user as { id: string }).id;

    await prisma.favorite.deleteMany({
      where: {
        userId,
        listingId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Morate biti prijavljeni" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Greška pri uklanjanju iz liste želja" },
      { status: 500 }
    );
  }
}

