import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessagesPreviewProps {
  userId: string;
}

export async function MessagesPreview({ userId }: MessagesPreviewProps) {
  const recentThreads = await prisma.messageThread.findMany({
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
          image: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
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
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  const filteredThreads = recentThreads.filter((thread) => thread.listing !== null);

  if (filteredThreads.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            Nemate poruka još.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {filteredThreads.map((thread) => {
        const lastMessage = thread.messages[0];
        const otherUser = thread.buyerId === userId ? thread.seller : thread.buyer;
        const unreadCount = thread._count.messages;
        const initials = otherUser.name
          ? otherUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U";

        return (
          <Link key={thread.id} href={`/dashboard/messages/${thread.id}`}>
            <Card className="group cursor-pointer transition-colors hover:bg-accent hover:border-[#D4AF37]/40">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {thread.listing?.photos[0] ? (
                      <Image
                        src={thread.listing.photos[0].url}
                        alt={thread.listing.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Nema slike
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {thread.listing?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={otherUser.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">
                            {otherUser.name || "Korisnik"}
                          </span>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-xs font-semibold text-neutral-900 shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {lastMessage.body}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
