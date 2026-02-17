import "server-only";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Lightweight endpoint for polling unread message count
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await prisma.message.count({
      where: {
        thread: {
          OR: [
            { buyerId: session.user.id },
            { sellerId: session.user.id },
          ],
        },
        senderId: { not: session.user.id },
        readAt: null,
      },
    });

    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "private, max-age=15" } }
    );
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
