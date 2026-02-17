import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { trackUserActivity } from "@/lib/track-activity";

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
          select: {
            id: true,
            body: true,
            createdAt: true,
            readAt: true,
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

    // Track user activity for email notification purposes (async, fire-and-forget)
    trackUserActivity(userId).catch(() => {});

    return NextResponse.json(thread);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    const errStack = error instanceof Error ? error.stack : undefined;
    if (errMessage === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Handle database connection errors
    if ((error as any).code === "P1001" || (error as any).name === "PrismaClientInitializationError") {
      logger.error("Database connection error", { error });
      return NextResponse.json(
        { error: "Greška pri povezivanju sa bazom podataka. Molimo pokušajte ponovo." },
        { status: 503 }
      );
    }
    logger.error("Error fetching thread", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

