"use client";

import Link from "next/link";
import { LayoutDashboard, FileText, MessageSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveRoute } from "@/lib/hooks/use-active-route";

const ITEMS = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Oglasi", icon: FileText, exact: false },
  { href: "/dashboard/messages", label: "Poruke", icon: MessageSquare, exact: false },
  { href: "/dashboard/wishlist", label: "Želje", icon: Heart, exact: false },
  { href: "/dashboard/profile", label: "Profil", icon: User, exact: false },
];

interface DashboardMobileNavProps {
  unreadCount?: number;
}

export function DashboardMobileNav({ unreadCount = 0 }: DashboardMobileNavProps) {
  const { isActive } = useActiveRoute();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors relative",
                active
                  ? "text-[#D4AF37]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              {item.href === "/dashboard/messages" && unreadCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 h-4 min-w-4 rounded-full bg-[#D4AF37] text-[10px] font-bold text-neutral-900 flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
