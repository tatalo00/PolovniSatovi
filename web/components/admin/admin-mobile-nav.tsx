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

interface AdminMobileNavProps {
  pendingListingsCount?: number;
  openReportsCount?: number;
  pendingVerificationsCount?: number;
}

const ITEMS = [
  { href: "/admin", label: "Pregled", icon: LayoutDashboard, exact: true, countKey: null },
  { href: "/admin/listings", label: "Oglasi", icon: FileText, exact: false, countKey: "listings" as const },
  { href: "/admin/reports", label: "Prijave", icon: AlertTriangle, exact: false, countKey: "reports" as const },
  { href: "/admin/verifications", label: "Verif.", icon: ShieldCheck, exact: false, countKey: "verifications" as const },
];

export function AdminMobileNav({
  pendingListingsCount = 0,
  openReportsCount = 0,
  pendingVerificationsCount = 0,
}: AdminMobileNavProps) {
  const { isActive } = useActiveRoute();

  const counts = {
    listings: pendingListingsCount,
    reports: openReportsCount,
    verifications: pendingVerificationsCount,
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          const count = item.countKey ? counts[item.countKey] : 0;

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
              {count > 0 && (
                <span className="absolute -top-0.5 right-0.5 h-4 min-w-4 rounded-full bg-[#D4AF37] text-[10px] font-bold text-neutral-900 flex items-center justify-center px-1">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
