"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Heart,
  User,
  Store,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveRoute } from "@/lib/hooks/use-active-route";

interface DashboardSidebarProps {
  userName?: string | null;
  isVerified?: boolean;
  unreadCount?: number;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Moji oglasi", icon: FileText, exact: false },
  { href: "/dashboard/messages", label: "Poruke", icon: MessageSquare, exact: false },
  { href: "/dashboard/wishlist", label: "Lista želja", icon: Heart, exact: false },
  { href: "/dashboard/profile", label: "Moj profil", icon: User, exact: false },
];

export function DashboardSidebar({ userName, isVerified, unreadCount = 0 }: DashboardSidebarProps) {
  const { isActive } = useActiveRoute();

  const items = [...NAV_ITEMS];
  if (isVerified) {
    items.push({
      href: "/dashboard/seller/profile",
      label: "Prodavnica",
      icon: Store,
      exact: false,
    });
  }

  return (
    <nav className="sticky top-24 space-y-1">
      <div className="mb-6 px-3">
        <p className="text-sm font-semibold text-foreground truncate">
          {userName || "Dashboard"}
        </p>
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-xs text-[#D4AF37] mt-1">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>

      {items.map((item) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
              active
                ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
            {item.href === "/dashboard/messages" && unreadCount > 0 && (
              <span className="ml-auto h-5 min-w-5 rounded-full bg-[#D4AF37] text-[11px] font-bold text-neutral-900 flex items-center justify-center px-1.5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
