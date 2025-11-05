"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
// Simple time formatter
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "upravo sada";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `pre ${minutes} ${minutes === 1 ? "minuta" : "minuta"}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `pre ${hours} ${hours === 1 ? "sata" : "sati"}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `pre ${days} ${days === 1 ? "dana" : "dana"}`;
}

interface MessageBubbleProps {
  message: {
    id: string;
    body: string;
    createdAt: Date | string;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initials = message.sender.name
    ? message.sender.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const timeAgo = formatTimeAgo(message.createdAt);

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.image || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col max-w-[70%] sm:max-w-[60%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <div className="text-xs text-muted-foreground mb-1 px-1">
            {message.sender.name || "Korisnik"}
          </div>
        )}
        <div
          className={cn(
            "rounded-lg px-4 py-2 break-words",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        </div>
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {timeAgo}
        </div>
      </div>
    </div>
  );
}

