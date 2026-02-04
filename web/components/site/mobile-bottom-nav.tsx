"use client";

import Link from "next/link";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveRoute } from "@/lib/hooks/use-active-route";

interface MobileBottomNavProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  unreadCount?: number;
}

export function MobileBottomNav({ user, unreadCount = 0 }: MobileBottomNavProps) {
  const { pathname, isActive } = useActiveRoute();

  // Dashboard has its own mobile nav
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const isLoggedIn = !!user;

  const navItems = [
    {
      href: "/",
      label: "Početna",
      icon: Home,
      exact: true,
    },
    {
      href: "/listings",
      label: "Oglasi",
      icon: Search,
      exact: false,
    },
    {
      href: "/sell",
      label: "Prodaj",
      icon: PlusCircle,
      exact: false,
    },
    ...(isLoggedIn
      ? [
          {
            href: "/dashboard/messages",
            label: "Poruke",
            icon: MessageSquare,
            exact: false,
          },
        ]
      : []),
    {
      href: isLoggedIn ? "/dashboard" : "/auth/signin",
      label: isLoggedIn ? "Profil" : "Prijava",
      icon: User,
      exact: false,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:hidden safe-area-inset-bottom" style={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}>
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          const showBadge = item.href === "/dashboard/messages" && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              {showBadge && (
                <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-[#D4AF37] text-[10px] font-bold text-neutral-900 flex items-center justify-center px-1">
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
