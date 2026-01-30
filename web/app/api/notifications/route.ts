import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return errorResponse("Unauthorized", 401);
  }

  const userId = session.user.id;

  const [recentMessages, recentStatusChanges, recentFavorites] = await Promise.all([
    prisma.message.findMany({
      where: {
        thread: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        senderId: { not: userId },
        readAt: null,
      },
      include: {
        sender: { select: { name: true } },
        thread: { select: { id: true, listing: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.listing.findMany({
      where: {
        sellerId: userId,
        status: { in: ["APPROVED", "REJECTED"] },
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true, title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.favorite.findMany({
      where: {
        listing: { sellerId: userId },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const items = [
    ...recentMessages.map((m) => ({
      type: "message" as const,
      title: `Nova poruka od ${m.sender.name || "korisnika"}`,
      description: m.thread.listing?.title || "",
      timestamp: m.createdAt.toISOString(),
      href: `/dashboard/messages/${m.thread.id}`,
      iconName: "MessageSquare" as const,
      color: "text-blue-600",
    })),
    ...recentStatusChanges.map((l) => ({
      type: "listing_status" as const,
      title: l.status === "APPROVED" ? "Oglas odobren" : "Oglas odbijen",
      description: l.title,
      timestamp: l.updatedAt.toISOString(),
      href: `/dashboard/listings/${l.id}`,
      iconName: (l.status === "APPROVED" ? "CheckCircle2" : "XCircle") as "CheckCircle2" | "XCircle",
      color: l.status === "APPROVED" ? "text-emerald-600" : "text-red-600",
    })),
    ...recentFavorites.map((f) => ({
      type: "favorite" as const,
      title: `${f.user.name || "Korisnik"} je sačuvao vaš oglas`,
      description: f.listing.title,
      timestamp: f.createdAt.toISOString(),
      href: "#",
      iconName: "Heart" as const,
      color: "text-pink-600",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const totalCount = recentMessages.length + recentStatusChanges.length + recentFavorites.length;

  return NextResponse.json(
    { items, totalCount },
    { headers: { "Cache-Control": "private, max-age=30" } }
  );
}
