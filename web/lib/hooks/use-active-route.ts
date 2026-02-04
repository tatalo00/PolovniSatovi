"use client";

import { usePathname } from "next/navigation";

interface UseActiveRouteReturn {
  pathname: string;
  isActive: (href: string, exact?: boolean) => boolean;
  isExactActive: (href: string) => boolean;
  isPrefixActive: (href: string) => boolean;
}

/**
 * Unified hook for detecting active routes across navigation components.
 * Consolidates logic previously duplicated in:
 * - dashboard/sidebar.tsx
 * - dashboard/mobile-nav.tsx
 * - site/navbar-links.tsx
 * - site/mobile-bottom-nav.tsx
 */
export function useActiveRoute(): UseActiveRouteReturn {
  const pathname = usePathname() ?? "/";

  const isExactActive = (href: string): boolean => {
    return pathname === href;
  };

  const isPrefixActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isActive = (href: string, exact: boolean = false): boolean => {
    if (exact) return isExactActive(href);
    return isPrefixActive(href);
  };

  return {
    pathname,
    isActive,
    isExactActive,
    isPrefixActive,
  };
}
