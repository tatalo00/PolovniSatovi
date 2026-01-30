"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, CheckCircle2, XCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimeAgo } from "@/lib/format-time";
import { cn } from "@/lib/utils";

interface NotificationItem {
  type: "message" | "listing_status" | "favorite";
  title: string;
  description: string;
  timestamp: string;
  href: string;
  iconName: "MessageSquare" | "CheckCircle2" | "XCircle" | "Heart";
  color: string;
}

const iconMap = {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Heart,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.items);
        setTotalCount(data.totalCount);
      }
    } catch {
      // Silently fail - non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
          aria-label="Obaveštenja"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-[#D4AF37] text-[10px] font-bold text-neutral-900 flex items-center justify-center px-1">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Obaveštenja</span>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              {totalCount} novo
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nema novih obaveštenja
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((item, i) => {
              const Icon = iconMap[item.iconName];
              return (
                <Link
                  key={`${item.type}-${i}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", item.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        <DropdownMenuSeparator />
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Pogledaj sve aktivnosti
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
