"use client";

import { useRouter } from "next/navigation";
import { ListingGrid } from "./listing-grid";
import { ActiveFilters } from "./active-filters";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { ListingSummary } from "@/types/listing";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";

interface ListingContentProps {
  listings: ListingSummary[];
  total: number;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  columns: number;
  perPage: number;
  initialFavoriteIds?: string[];
}

export function ListingContent({
  listings,
  total,
  currentPage,
  totalPages,
  searchParams,
  columns,
  perPage,
  initialFavoriteIds = [],
}: ListingContentProps) {
  const router = useRouter();
  const { start: startNavigation } = useNavigationFeedback();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const scrollUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(initialFavoriteIds)
  );

  const handleFavoriteToggle = useCallback((listingId: string, nextValue: boolean) => {
    setFavoriteIds((prev) => {
      const updated = new Set(prev);
      if (nextValue) {
        updated.add(listingId);
      } else {
        updated.delete(listingId);
      }
      return updated;
    });
  }, []);

  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        params.set(key, value);
      }
    });
    return params;
  }, [searchParams]);

  const deferredListings = useDeferredValue(listings);
  const favoriteIdSnapshot = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const deferredScrollKey = useDeferredValue(search);

  const saveScrollPosition = useCallback((position: number) => {
    if (typeof window === "undefined") return;
    const currentState = window.history.state ?? {};
    if (
      currentState?.listingState?.scroll === position &&
      currentState?.listingState?.search === window.location.search
    ) {
      return;
    }
    window.history.replaceState(
      {
        ...currentState,
        listingState: {
          scroll: position,
          search: window.location.search,
          timestamp: Date.now(),
        },
      },
      ""
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const state = window.history.state?.listingState;
    requestAnimationFrame(() => {
      if (state && state.search === window.location.search) {
        window.scrollTo(0, state.scroll ?? 0);
      } else {
        window.scrollTo(0, 0);
      }
    });
  }, [search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      if (scrollUpdateRef.current) {
        clearTimeout(scrollUpdateRef.current);
      }
      scrollUpdateRef.current = setTimeout(() => {
        saveScrollPosition(window.scrollY);
      }, 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (scrollUpdateRef.current) {
        clearTimeout(scrollUpdateRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [saveScrollPosition]);

  const handleSortChange = (sort: string) => {
    const params = buildSearchParams();
    params.set("sort", sort);
    params.delete("page");
    const queryString = params.toString();
    startNavigation({ immediate: true });
    router.replace(queryString ? `/listings?${queryString}` : "/listings", {
      scroll: false,
    });
  };

  const handleColumnsChange = (columnCount: number) => {
    const params = buildSearchParams();
    params.set("cols", columnCount.toString());
    params.delete("page");
    const queryString = params.toString();
    startNavigation({ immediate: true });
    router.replace(queryString ? `/listings?${queryString}` : "/listings", {
      scroll: false,
    });
  };

  const buildPageUrl = (page: number) => {
    const params = buildSearchParams();
    params.set("page", page.toString());
    return `/listings?${params.toString()}`;
  };

  return (
    <>
      <ActiveFilters searchParams={searchParams} />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Pronađeno {total} oglasa · {perPage} po stranici
        </p>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">Prikaz:</span>
            <div className="inline-flex rounded-md border border-input bg-background p-1 text-sm shadow-sm">
              {[3, 4, 5].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleColumnsChange(option)}
                  className={`rounded-sm px-3 py-1 transition ${
                    columns === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  aria-pressed={columns === option}
                >
                  {option} u redu
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm">
              Sortiraj:
            </label>
            <select
              id="sort"
              value={searchParams.sort || "newest"}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Najnoviji</option>
              <option value="oldest">Najstariji</option>
              <option value="price-asc">Cena: najniža</option>
              <option value="price-desc">Cena: najviša</option>
              <option value="year-desc">Godina: najnovija</option>
              <option value="year-asc">Godina: najstarija</option>
            </select>
          </div>
        </div>
      </div>

      <ListingGrid
        listings={deferredListings}
        columns={columns}
        scrollKey={deferredScrollKey}
        favoriteIds={favoriteIdSnapshot}
        onToggleFavorite={handleFavoriteToggle}
      />

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={buildPageUrl(currentPage - 1)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Prethodna
            </a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
            )
            .map((p, idx, arr) => (
              <div key={p} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2">...</span>}
                <a
                  href={buildPageUrl(p)}
                  className={`rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent ${
                    p === currentPage ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {p}
                </a>
              </div>
            ))}
          {currentPage < totalPages && (
            <a
              href={buildPageUrl(currentPage + 1)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Sledeća
            </a>
          )}
        </div>
      )}
    </>
  );
}

