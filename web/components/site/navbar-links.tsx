"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/listings", label: "Pogledaj oglase" },
  { href: "/sell", label: "Prodaj sat" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "O nama" },
  { href: "/contact", label: "Kontakt" },
] as const;

export function NavLinks() {
  const pathname = usePathname() ?? "/";

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex items-center text-base font-medium tracking-tight transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {isActive && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>
        );
      })}
    </>
  );
}
