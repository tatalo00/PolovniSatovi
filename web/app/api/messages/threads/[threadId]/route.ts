import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

// GET - Get thread details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { threadId } = await params;

    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            priceEurCents: true,
            photos: {
              take: 1,
              orderBy: { order: "asc" },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Konverzacija nije pronađena" },
        { status: 404 }
      );
    }

    // Check if user is part of this thread
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(thread);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    logger.error("Error fetching thread", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

