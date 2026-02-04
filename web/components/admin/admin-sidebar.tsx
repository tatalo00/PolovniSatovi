"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveRoute } from "@/lib/hooks/use-active-route";

interface AdminSidebarProps {
  pendingListingsCount?: number;
  openReportsCount?: number;
  pendingVerificationsCount?: number;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Pregled", icon: LayoutDashboard, exact: true, countKey: null },
  { href: "/admin/listings", label: "Oglasi", icon: FileText, exact: false, countKey: "listings" as const },
  { href: "/admin/reports", label: "Prijave", icon: AlertTriangle, exact: false, countKey: "reports" as const },
  { href: "/admin/verifications", label: "Verifikacije", icon: ShieldCheck, exact: false, countKey: "verifications" as const },
];

export function AdminSidebar({
  pendingListingsCount = 0,
  openReportsCount = 0,
  pendingVerificationsCount = 0,
}: AdminSidebarProps) {
  const { isActive } = useActiveRoute();

  const counts = {
    listings: pendingListingsCount,
    reports: openReportsCount,
    verifications: pendingVerificationsCount,
  };

  return (
    <nav className="sticky top-24 space-y-1">
      <div className="mb-6 px-3">
        <p className="text-sm font-semibold text-foreground">
          Admin Panel
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upravljanje platformom
        </p>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;
        const count = item.countKey ? counts[item.countKey] : 0;

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
            {count > 0 && (
              <span className="ml-auto h-5 min-w-5 rounded-full bg-[#D4AF37] text-[11px] font-bold text-neutral-900 flex items-center justify-center px-1.5">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
