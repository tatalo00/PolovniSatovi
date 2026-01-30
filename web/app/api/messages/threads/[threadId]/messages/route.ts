import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { updateSellerResponseTime } from "@/lib/seller-response-time";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

const createMessageSchema = z.object({
  body: z.string().min(1, "Poruka ne može biti prazna").max(5000, "Poruka je predugačka"),
});

// GET - Get messages in a thread
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { threadId } = await params;

    // Verify user has access to this thread
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      select: { buyerId: true, sellerId: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Konverzacija nije pronađena" },
        { status: 404 }
      );
    }

    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { threadId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
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
    logger.error("Error fetching messages", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

// POST - Send a message in a thread
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { threadId } = await params;
    const body = await request.json();
    const { body: messageBody } = createMessageSchema.parse(body);

    // Verify user has access to this thread
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      select: { buyerId: true, sellerId: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Konverzacija nije pronađena" },
        { status: 404 }
      );
    }

    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        body: messageBody,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update thread updatedAt by updating a field (we'll use a transaction)
    await prisma.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    // Async update seller response time when seller sends a message
    if (thread.sellerId === userId) {
      updateSellerResponseTime(thread.sellerId).catch((err) =>
        logger.error("Failed to update response time", { error: String(err) })
      );
    }

    return NextResponse.json(message, { status: 201 });
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
    logger.error("Error creating message", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

