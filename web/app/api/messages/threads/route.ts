import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const createThreadSchema = z.object({
  listingId: z.string().min(1, "Listing ID je obavezan"),
});

// GET - Get all threads for current user
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
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
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readAt: null,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculate updatedAt from last message
    const threadsWithLastMessage = threads.map((thread) => {
      const lastMessage = thread.messages[0];
      return {
        ...thread,
        updatedAt: lastMessage?.createdAt || thread.createdAt,
        unreadCount: thread._count.messages,
      };
    });

    // Sort by updatedAt
    threadsWithLastMessage.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json(threadsWithLastMessage);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Handle database connection errors
    if (error.code === "P1001" || error.name === "PrismaClientInitializationError") {
      logger.error("Database connection error", { error });
      return NextResponse.json(
        { error: "Greška pri povezivanju sa bazom podataka. Molimo pokušajte ponovo." },
        { status: 503 }
      );
    }
    logger.error("Error fetching threads", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

// POST - Create a new thread
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const body = await request.json();
    const { listingId } = createThreadSchema.parse(body);

    // Get listing with seller info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Oglas nije pronađen" },
        { status: 404 }
      );
    }

    if (listing.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Oglas nije odobren" },
        { status: 400 }
      );
    }

    if (listing.sellerId === userId) {
      return NextResponse.json(
        { error: "Ne možete kontaktirati samog sebe" },
        { status: 400 }
      );
    }

    // Check if thread already exists
    const existingThread = await prisma.messageThread.findFirst({
      where: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
    });

    if (existingThread) {
      return NextResponse.json(existingThread, { status: 200 });
    }

    // Create new thread
    const thread = await prisma.messageThread.create({
      data: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
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
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    // Handle database connection errors
    if (error.code === "P1001" || error.name === "PrismaClientInitializationError") {
      logger.error("Database connection error", { error });
      return NextResponse.json(
        { error: "Greška pri povezivanju sa bazom podataka. Molimo pokušajte ponovo." },
        { status: 503 }
      );
    }
    logger.error("Error creating thread", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

