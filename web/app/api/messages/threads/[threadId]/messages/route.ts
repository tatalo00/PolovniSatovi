import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { updateSellerResponseTime } from "@/lib/seller-response-time";
import { sendNewMessageEmail } from "@/lib/email";
import { z } from "zod";

const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const EMAIL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    // Verify user has access to this thread and get listing info
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      select: {
        buyerId: true,
        sellerId: true,
        listing: {
          select: {
            title: true,
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

    // Send email notification to recipient (async, fire-and-forget)
    const recipientId = thread.buyerId === userId ? thread.sellerId : thread.buyerId;
    notifyRecipient({
      recipientId,
      senderName: message.sender.name || "Korisnik",
      listingTitle: thread.listing?.title || "Oglas",
      messagePreview: messageBody,
      threadId,
    }).catch((err) =>
      logger.error("Failed to send message notification", { error: String(err) })
    );

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

// Helper function to notify recipient via email (max 1 email per day)
async function notifyRecipient({
  recipientId,
  senderName,
  listingTitle,
  messagePreview,
  threadId,
}: {
  recipientId: string;
  senderName: string;
  listingTitle: string;
  messagePreview: string;
  threadId: string;
}) {
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: {
      email: true,
      name: true,
      lastSeenAt: true,
      lastMessageEmailAt: true,
    },
  });

  if (!recipient?.email) return;

  const now = Date.now();
  const lastSeen = recipient.lastSeenAt?.getTime() || 0;
  const lastEmailSent = recipient.lastMessageEmailAt?.getTime() || 0;

  // Check if user is inactive (not seen in last 5 minutes)
  const isInactive = now - lastSeen > INACTIVITY_THRESHOLD_MS;
  // Check if cooldown passed (last email was more than 24 hours ago)
  const cooldownPassed = now - lastEmailSent > EMAIL_COOLDOWN_MS;

  if (!isInactive || !cooldownPassed) {
    return; // Don't send email
  }

  // Send email
  const threadUrl = `${process.env.NEXTAUTH_URL}/dashboard/messages/${threadId}`;
  await sendNewMessageEmail({
    to: recipient.email,
    recipientName: recipient.name,
    senderName,
    listingTitle,
    messagePreview,
    threadUrl,
  });

  // Update lastMessageEmailAt
  await prisma.user.update({
    where: { id: recipientId },
    data: { lastMessageEmailAt: new Date() },
  });
}

