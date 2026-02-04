"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "polovnisatovi_last_search";

interface SearchHistoryState {
  url: string;
  label: string;
  timestamp: number;
}

/**
 * Hook to track search/listing browsing history for back-to-results navigation.
 * Stores the last search URL in sessionStorage so users can return to their
 * filtered listing results from individual listing pages.
 */
export function useSearchHistory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lastSearch, setLastSearch] = useState<SearchHistoryState | null>(null);

  // Load last search from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLastSearch(JSON.parse(stored));
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Save search state when on listings page
  useEffect(() => {
    if (pathname === "/listings") {
      const params = searchParams?.toString();
      const url = params ? `/listings?${params}` : "/listings";

      // Build a descriptive label
      const labelParts: string[] = [];
      const brand = searchParams?.get("brand");
      const q = searchParams?.get("q");

      if (q) {
        labelParts.push(`"${q}"`);
      }
      if (brand) {
        labelParts.push(brand);
      }

      const label = labelParts.length > 0
        ? `Rezultati: ${labelParts.join(", ")}`
        : "Svi oglasi";

      const state: SearchHistoryState = {
        url,
        label,
        timestamp: Date.now(),
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setLastSearch(state);
      } catch {
        // Ignore sessionStorage errors
      }
    }
  }, [pathname, searchParams]);

  // Check if we have a valid recent search (within 30 minutes)
  const hasRecentSearch = useCallback(() => {
    if (!lastSearch) return false;
    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - lastSearch.timestamp < thirtyMinutes;
  }, [lastSearch]);

  // Get back-to-results link data
  const getBackToResults = useCallback(() => {
    if (!hasRecentSearch()) return null;
    return {
      href: lastSearch!.url,
      label: lastSearch!.label,
    };
  }, [lastSearch, hasRecentSearch]);

  return {
    lastSearch,
    hasRecentSearch,
    getBackToResults,
  };
}
