"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

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

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:hidden safe-area-inset-bottom" style={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}>
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
              }}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors cursor-pointer",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

