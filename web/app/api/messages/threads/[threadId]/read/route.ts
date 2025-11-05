import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

// POST - Mark messages in a thread as read
export async function POST(request: Request, { params }: RouteParams) {
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

    // Mark all unread messages as read (messages not sent by current user)
    await prisma.message.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    logger.error("Error marking messages as read", { error });
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}

