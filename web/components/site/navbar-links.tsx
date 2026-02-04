"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useActiveRoute } from "@/lib/hooks/use-active-route";

const NAV_ITEMS = [
  { href: "/listings", label: "Pogledaj oglase" },
  { href: "/sell", label: "Prodaj sat" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "O nama" },
  { href: "/contact", label: "Kontakt" },
] as const;

export function NavLinks() {
  const { isActive } = useActiveRoute();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex items-center text-base font-medium tracking-tight transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {active && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>
        );
      })}
    </>
  );
}
