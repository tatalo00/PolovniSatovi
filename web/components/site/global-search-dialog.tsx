"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const POPULAR_BRANDS = [
  "Rolex",
  "Omega",
  "Seiko",
  "Tag Heuer",
  "Tissot",
  "Casio",
];

const RECENT_SEARCHES_KEY = "polovnisatovi_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          // Invalid JSON, clear it
          localStorage.removeItem(RECENT_SEARCHES_KEY);
        }
      }
    }
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure dialog is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim();
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  }, [recentSearches]);

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    saveRecentSearch(searchQuery);
    onOpenChange(false);
    setQuery("");
    startTransition(() => {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    });
  }, [router, onOpenChange, saveRecentSearch]);

  const handleBrandClick = useCallback((brand: string) => {
    saveRecentSearch(brand);
    onOpenChange(false);
    setQuery("");
    startTransition(() => {
      router.push(`/listings?brand=${encodeURIComponent(brand)}`);
    });
  }, [router, onOpenChange, saveRecentSearch]);

  const handleRecentSearchClick = useCallback((search: string) => {
    onOpenChange(false);
    setQuery("");
    startTransition(() => {
      router.push(`/listings?q=${encodeURIComponent(search)}`);
    });
  }, [router, onOpenChange]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Pretraži satove</DialogTitle>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži po marki, modelu, referenci..."
            className="border-0 focus-visible:ring-0 text-base h-auto py-0 px-0"
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Obriši</span>
            </Button>
          )}
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Nedavne pretrage
                </p>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Obriši
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleRecentSearchClick(search)}
                    className="rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Brands */}
          <div className="px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3 w-3" />
              Popularne marke
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandClick(brand)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted hover:border-[#D4AF37]/50 transition-colors"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Search Hint */}
          <div className="px-4 py-3 bg-muted/50 text-xs text-muted-foreground">
            <p>
              Tip: Pretraži po referentnom broju (npr. &quot;116500LN&quot;) za preciznije rezultate
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
