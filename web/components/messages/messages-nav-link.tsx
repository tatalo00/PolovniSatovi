"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnreadBadge } from "./unread-badge";
import { MessageSquare } from "lucide-react";

interface MessageThread {
  unreadCount?: number;
}

export function MessagesNavLink() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/threads");
      if (response.ok) {
        const threads: MessageThread[] = await response.json();
        const totalUnread = threads.reduce(
          (sum: number, thread: MessageThread) => sum + (thread.unreadCount || 0),
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <Button variant="ghost" asChild className="relative">
      <Link href="/dashboard/messages" className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="hidden md:inline">Poruke</span>
        <UnreadBadge count={unreadCount} />
      </Link>
    </Button>
  );
}

