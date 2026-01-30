"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UnreadBadge } from "./unread-badge";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/format-time";
import { useSession } from "next-auth/react";

interface Thread {
  id: string;
  buyerId: string;
  sellerId: string;
  listing: {
    id: string;
    title: string;
    photos: Array<{ url: string }>;
  };
  buyer: {
    id: string;
    name: string | null;
    image: string | null;
  };
  seller: {
    id: string;
    name: string | null;
    image: string | null;
  };
  messages: Array<{
    body: string;
    sender: {
      id: string;
      name: string | null;
    };
  }>;
  updatedAt: Date | string;
  unreadCount: number;
}

interface MessageThreadListProps {
  className?: string;
}

export function MessageThreadList({ className }: MessageThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    fetchThreads();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchThreads, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/messages/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Nemate poruka</p>
        </CardContent>
      </Card>
    );
  }

  const currentUserId = (session?.user as any)?.id;

  return (
    <div className={cn("space-y-2", className)}>
      {threads.map((thread) => {
        const lastMessage = thread.messages[0];
        const otherUser = thread.buyerId === currentUserId ? thread.seller : thread.buyer;
        const isActive = pathname?.includes(`/messages/${thread.id}`);

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
            <Card
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent",
                isActive && "bg-accent border-primary"
              )}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Listing Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {thread.listing.photos[0] ? (
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

                  {/* Thread Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {thread.listing.title}
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
                      <UnreadBadge count={thread.unreadCount} />
                    </div>

                    {lastMessage && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {lastMessage.body}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(thread.updatedAt)}
                    </div>
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

