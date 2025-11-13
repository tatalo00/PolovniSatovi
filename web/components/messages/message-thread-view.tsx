"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageThreadViewProps {
  threadId: string;
}

interface Thread {
  id: string;
  listing: {
    id: string;
    title: string;
    priceEurCents: number;
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
    id: string;
    body: string;
    createdAt: Date | string;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
}

export function MessageThreadView({ threadId }: MessageThreadViewProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user && "id" in session.user ? (session.user as { id: string }).id : undefined;

  const fetchThread = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/threads/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setThread((prev) => {
          const prevLastId = prev?.messages.at(-1)?.id;
          const nextLastId = data.messages.at(-1)?.id;
          const shouldScroll =
            !prev?.messages.length ||
            prevLastId !== nextLastId ||
            messagesEndRef.current === document.activeElement;

          if (shouldScroll) {
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            });
          }

          return data;
        });

        if (currentUserId) {
          fetch(`/api/messages/threads/${threadId}/read`, {
            method: "POST",
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, threadId]);

  useEffect(() => {
    fetchThread();
    const interval = setInterval(fetchThread, 10000);
    return () => clearInterval(interval);
  }, [fetchThread]);

  useEffect(() => {
    if (!thread?.messages.length) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [thread?.messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const handleMessageSent = () => {
    fetchThread();
    setTimeout(scrollToBottom, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Konverzacija nije pronađena</p>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="mt-4">
              Nazad na poruke
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const otherUser = thread.buyer.id === currentUserId ? thread.seller : thread.buyer;
  const initials = otherUser.name
    ? otherUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="rounded-b-none border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/messages">
              <Button variant="ghost" size="icon" className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/listing/${thread.listing.id}`}>
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                {thread.listing.photos[0] ? (
                  <Image
                    src={thread.listing.photos[0].url}
                    alt={thread.listing.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    Nema slike
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/listing/${thread.listing.id}`}>
                <CardTitle className="text-base hover:underline cursor-pointer line-clamp-1">
                  {thread.listing.title}
                </CardTitle>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={otherUser.image || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {otherUser.name || "Korisnik"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 rounded-none border-x overflow-hidden flex flex-col">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {thread.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nema poruka u ovoj konverzaciji</p>
              <p className="text-sm mt-2">Pošaljite prvu poruku!</p>
            </div>
          ) : (
            thread.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender.id === currentUserId}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <MessageComposer threadId={threadId} onMessageSent={handleMessageSent} />
      </Card>
    </div>
  );
}

