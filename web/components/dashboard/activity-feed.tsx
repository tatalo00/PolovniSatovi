import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Heart,
  Plus,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/format-time";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ActivityFeedProps {
  userId: string;
}

export async function ActivityFeed({ userId }: ActivityFeedProps) {
  const [recentMessages, recentStatusChanges, recentFavorites] = await Promise.all([
    prisma.message.findMany({
      where: {
        thread: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        senderId: { not: userId },
      },
      include: {
        sender: { select: { name: true } },
        thread: { select: { id: true, listing: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.listing.findMany({
      where: { sellerId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      select: { id: true, title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.favorite.findMany({
      where: { listing: { sellerId: userId } },
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const activities = [
    ...recentMessages.map((m) => ({
      type: "message" as const,
      title: `Nova poruka od ${m.sender.name || "korisnika"}`,
      description: m.thread.listing?.title || "",
      timestamp: m.createdAt,
      href: `/dashboard/messages/${m.thread.id}`,
      iconName: "MessageSquare" as const,
      color: "text-blue-600",
    })),
    ...recentStatusChanges.map((l) => ({
      type: "status" as const,
      title: l.status === "APPROVED" ? "Oglas odobren" : "Oglas odbijen",
      description: l.title,
      timestamp: l.updatedAt,
      href: `/dashboard/listings/${l.id}`,
      iconName: (l.status === "APPROVED" ? "CheckCircle2" : "XCircle") as "CheckCircle2" | "XCircle",
      color: l.status === "APPROVED" ? "text-emerald-600" : "text-red-600",
    })),
    ...recentFavorites.map((f) => ({
      type: "favorite" as const,
      title: `${f.user.name || "Korisnik"} je sačuvao vaš oglas`,
      description: f.listing.title,
      timestamp: f.createdAt,
      href: "#",
      iconName: "Heart" as const,
      color: "text-pink-600",
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const iconMap = {
    MessageSquare,
    CheckCircle2,
    XCircle,
    Heart,
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Još nema aktivnosti. Kreirajte vaš prvi oglas da biste počeli!
          </p>
          <Button asChild className="bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900">
            <Link href="/dashboard/listings/new">
              <Plus className="mr-2 h-4 w-4" />
              Kreiraj novi oglas
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nedavna aktivnost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {activities.map((activity, i) => {
          const Icon = iconMap[activity.iconName];
          return (
            <Link
              key={`${activity.type}-${i}`}
              href={activity.href}
              className="flex items-start gap-3 px-6 py-3 hover:bg-muted/50 transition-colors border-b last:border-0"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
