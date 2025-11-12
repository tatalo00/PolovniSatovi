"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Watch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FeaturedListing = {
  id: string;
  brand: string;
  model: string;
  title: string;
  priceEurCents: number;
  condition: string;
  photoUrl?: string | null;
};

type HeroSuggestion = {
  id: string;
  label: string;
  type: "brand" | "model";
  secondary?: string | null;
  avgPriceEurCents?: number | null;
  listingsCount?: number | null;
};

type QuickFilter = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  query?: Record<string, string>;
  requiresLocation?: boolean;
};

type HeroFilterState = {
  brand: string;
  min: string;
  max: string;
  cond: string;
  movement: string;
  loc: string;
  verified: boolean;
  box: string;
};

const createDefaultFilterState = (): HeroFilterState => ({
  brand: "",
  min: "",
  max: "",
  cond: "",
  movement: "",
  loc: "",
  verified: false,
  box: "",
});

export interface HeroProps {
  featuredListings: FeaturedListing[];
  totalListings: number;
  totalSellers: number;
  userLocation?: string | null;
}

const CAROUSEL_ROTATION_MS = 5000;
const MAX_HISTORY = 8;

const QUICK_FILTERS: QuickFilter[] = [
  {
    id: "under-200",
    label: "Ispod €200",
    description: "Pristupačni satovi za svaki dan",
    icon: <Watch className="h-4 w-4" aria-hidden />,
    query: { max: "200" },
  },
  {
    id: "verified",
    label: "Verifikovani prodavci",
    description: "Potvrđena bezbednost kupovine",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    query: { verified: "1" },
  },
  {
    id: "automatic",
    label: "Automatski mehanizam",
    description: "Samonavijajući satovi",
    icon: <RefreshCcw className="h-4 w-4" aria-hidden />,
    query: { movement: "Automatic" },
  },
  {
    id: "near-me",
    label: "U mojoj blizini",
    description: "Pogledajte uživo pre kupovine",
    icon: <MapPin className="h-4 w-4" aria-hidden />,
    requiresLocation: true,
  },
];

function formatPrice(eurCents?: number | null) {
  if (eurCents == null) return null;
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eurCents / 100);
}

export function Hero({
  featuredListings,
  totalListings,
  totalSellers,
  userLocation,
}: HeroProps) {
  const router = useRouter();
  const { start: startNavigation } = useNavigationFeedback();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<HeroSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [filters, setFilters] = useState<HeroFilterState>(() => createDefaultFilterState());
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const brandAbortRef = useRef<AbortController | null>(null);
  const brandBlurTimeout = useRef<NodeJS.Timeout | null>(null);
  const additionalActiveCount = useMemo(() => {
    let count = 0;
    if (filters.cond) count += 1;
    if (filters.verified) count += 1;
    if (filters.box) count += 1;
    return count;
  }, [filters.box, filters.cond, filters.verified]);

  const hasFeatured = featuredListings.length > 0;

  useEffect(() => {
    const stored = window.localStorage.getItem("ps-search-history");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setSearchHistory(parsed.slice(0, MAX_HISTORY));
      }
    } catch {
      // ignore invalid JSON
    }
  }, []);

  useEffect(() => {
    if (!hasFeatured) return;

    if (autoRotateRef.current) {
      clearTimeout(autoRotateRef.current);
    }

    autoRotateRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredListings.length);
    }, CAROUSEL_ROTATION_MS);

    return () => {
      if (autoRotateRef.current) {
        clearTimeout(autoRotateRef.current);
      }
    };
  }, [currentSlide, featuredListings.length, hasFeatured]);

  const fetchSuggestions = useCallback(
    async (value: string) => {
      if (value.trim().length < 2) {
        abortControllerRef.current?.abort();
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoadingSuggestions(true);

      try {
        const paramsBrand = new URLSearchParams({
          type: "brand",
          q: value,
          detail: "1",
        });
        const paramsModel = new URLSearchParams({
          type: "model",
          q: value,
          detail: "1",
        });

        const [brandRes, modelRes] = await Promise.all([
          fetch(`/api/listings/suggest?${paramsBrand.toString()}`, {
            signal: controller.signal,
          }),
          fetch(`/api/listings/suggest?${paramsModel.toString()}`, {
            signal: controller.signal,
          }),
        ]);

        if (!brandRes.ok && !modelRes.ok) {
          throw new Error("Suggestion request failed");
        }

        const brandData = brandRes.ok ? ((await brandRes.json()) as HeroSuggestion[]) : [];
        const modelData = modelRes.ok ? ((await modelRes.json()) as HeroSuggestion[]) : [];

        const merged = [...brandData, ...modelData].slice(0, 8);
        setSuggestions(merged);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    []
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSuggestions(query);
    }, 220);

    return () => clearTimeout(debounce);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const query = filters.brand.trim();
    if (query.length < 2) {
      brandAbortRef.current?.abort();
      setBrandSuggestions([]);
      setBrandLoading(false);
      return;
    }

    setBrandLoading(true);
    const controller = new AbortController();
    brandAbortRef.current?.abort();
    brandAbortRef.current = controller;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/listings/suggest?type=brand&q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch brand suggestions");
        }
        const data = (await response.json()) as string[];
        const unique = Array.from(
          new Set(
            data
              .map((value) => value?.trim())
              .filter((value): value is string => Boolean(value && value.length > 0))
          )
        );
        setBrandSuggestions(unique.slice(0, 8));
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        if (process.env.NODE_ENV !== "production") {
          console.error("Brand suggestions error:", error);
        }
      } finally {
        setBrandLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters.brand]);

  useEffect(
    () => () => {
      brandAbortRef.current?.abort();
      if (brandBlurTimeout.current) {
        clearTimeout(brandBlurTimeout.current);
      }
    },
    []
  );

  const persistHistory = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const next = [trimmed, ...searchHistory.filter((item) => item !== trimmed)].slice(
      0,
      MAX_HISTORY
    );
    setSearchHistory(next);
    window.localStorage.setItem("ps-search-history", JSON.stringify(next));
  }, [searchHistory]);

  const performNavigation = useCallback(
    (params: URLSearchParams) => {
      startNavigation({ immediate: true });
      router.push(params.toString() ? `/listings?${params.toString()}` : "/listings");
    },
    [router, startNavigation]
  );

  const handleSearchSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!query.trim()) return;
      persistHistory(query);
      const params = new URLSearchParams({ q: query.trim() });
      performNavigation(params);
      setShowHistory(false);
    },
    [performNavigation, persistHistory, query]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: HeroSuggestion) => {
      const params = new URLSearchParams();
      if (suggestion.type === "brand") {
        params.set("brand", suggestion.label);
      } else {
        params.set("model", suggestion.label);
        if (suggestion.secondary) {
          params.set("brand", suggestion.secondary);
        }
      }
      persistHistory(suggestion.label);
      performNavigation(params);
      setQuery("");
      setSuggestions([]);
      setShowHistory(false);
    },
    [performNavigation, persistHistory]
  );

  const handleHistorySelect = useCallback(
    (value: string) => {
      setQuery(value);
      const params = new URLSearchParams({ q: value });
      performNavigation(params);
    },
    [performNavigation]
  );

  const handleBrandFocus = useCallback(() => {
    if (brandBlurTimeout.current) {
      clearTimeout(brandBlurTimeout.current);
    }
    setBrandOpen(true);
  }, []);

  const handleBrandBlur = useCallback(() => {
    brandBlurTimeout.current = setTimeout(() => setBrandOpen(false), 120);
  }, []);

  const handleBrandSelect = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFilters((prev) => ({
      ...prev,
      brand: trimmed,
    }));
    setBrandOpen(false);
  }, []);

  const handleFiltersSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const params = new URLSearchParams();
      if (filters.brand.trim()) {
        params.set("brand", filters.brand.trim());
      }
      if (filters.min.trim()) {
        params.set("min", filters.min.trim());
      }
      if (filters.max.trim()) {
        params.set("max", filters.max.trim());
      }
      if (filters.cond.trim()) {
        params.set("cond", filters.cond.trim());
      }
      if (filters.movement.trim()) {
        params.set("movement", filters.movement.trim());
      }
      if (filters.loc.trim()) {
        params.set("loc", filters.loc.trim());
      }
      if (filters.verified) {
        params.set("verified", "1");
      }
      if (filters.box) {
        params.set("box", filters.box);
      }

      if (filters.loc.trim()) {
        window.localStorage.setItem("ps-last-location", filters.loc.trim());
      }

      performNavigation(params);
    },
    [filters, performNavigation]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(createDefaultFilterState());
    setBrandSuggestions([]);
    setBrandOpen(false);
    performNavigation(new URLSearchParams());
  }, [performNavigation]);

  const handleQuickFilter = useCallback(
    (filter: QuickFilter) => {
      if (filter.requiresLocation) {
        const storedLocation =
          userLocation || window.localStorage.getItem("ps-last-location") || "";
        if (storedLocation) {
          const params = new URLSearchParams({ loc: storedLocation });
          performNavigation(params);
          return;
        }

        const manual = window.prompt(
          "Unesite grad ili lokaciju koju želite da pretražite:",
          ""
        );
        if (manual && manual.trim()) {
          window.localStorage.setItem("ps-last-location", manual.trim());
          const params = new URLSearchParams({ loc: manual.trim() });
          performNavigation(params);
        }
        return;
      }

      if (!filter.query) return;
      const params = new URLSearchParams(filter.query);
      performNavigation(params);
    },
    [performNavigation, userLocation]
  );

  const slides = useMemo(() => {
    if (!hasFeatured) return [];
    return featuredListings.map((listing) => ({
      ...listing,
      priceLabel: formatPrice(listing.priceEurCents),
    }));
  }, [featuredListings, hasFeatured]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-primary/10 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)] dark:bg-primary/20" />
      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr),minmax(0,1fr)] lg:items-start">
          <div>
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
                  Marketplace #1 za ljubitelje satova na Balkanu
                </Badge>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Pronađite sledeći sat u svojoj kolekciji
                </h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
                  Personalizovana selekcija proverenih oglasa, trendova i vodiča za kupovinu
                  polovnih i vintage satova.
                </p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <form
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
                  onSubmit={handleFiltersSubmit}
                >
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="hero-filter-brand">Marka</Label>
                    <div className="relative">
                      <Input
                        id="hero-filter-brand"
                        placeholder="npr. Rolex"
                        value={filters.brand}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            brand: event.target.value,
                          }))
                        }
                        onFocus={handleBrandFocus}
                        onBlur={handleBrandBlur}
                        autoComplete="off"
                      />
                      {brandOpen && (
                        <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border bg-popover shadow-lg">
                          {filters.brand.trim().length < 2 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              Unesite bar dva slova za sugestije marki.
                            </div>
                          ) : (
                            <ul className="max-h-56 overflow-y-auto py-1 text-sm">
                              {brandLoading ? (
                                <li className="px-3 py-2 text-muted-foreground">
                                  Pretraga...
                                </li>
                              ) : brandSuggestions.length > 0 ? (
                                brandSuggestions.map((suggestion) => (
                                  <li key={suggestion}>
                                    <button
                                      type="button"
                                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        handleBrandSelect(suggestion);
                                      }}
                                    >
                                      <span>{suggestion}</span>
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li className="px-3 py-2 text-muted-foreground">
                                  Nema rezultata
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="hero-filter-price-min">Cena (EUR)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id="hero-filter-price-min"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Min"
                        value={filters.min}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            min: event.target.value,
                          }))
                        }
                      />
                      <Input
                        id="hero-filter-price-max"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Max"
                        value={filters.max}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            max: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-filter-movement">Mehanizam</Label>
                    <Select
                      value={filters.movement || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          movement: value === "all" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger id="hero-filter-movement">
                        <SelectValue placeholder="Svi tipovi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Svi tipovi</SelectItem>
                        <SelectItem value="Automatic">Automatski</SelectItem>
                        <SelectItem value="Manual">Mehanički (ručno)</SelectItem>
                        <SelectItem value="Quartz">Kvarcni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-filter-location">Lokacija</Label>
                    <Input
                      id="hero-filter-location"
                      placeholder="npr. Beograd"
                      value={filters.loc}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          loc: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-3 lg:col-span-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between rounded-full sm:w-auto"
                          >
                            <span>Dodatni filteri</span>
                            <span className="flex items-center gap-2">
                              {additionalActiveCount > 0 && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  {additionalActiveCount}
                                </span>
                              )}
                              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 space-y-2 p-2" align="end">
                          <DropdownMenuLabel>Stanje</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={filters.cond || "all"}
                            onValueChange={(value) =>
                              setFilters((prev) => ({
                                ...prev,
                                cond: value === "all" ? "" : value,
                              }))
                            }
                          >
                            <DropdownMenuRadioItem value="all">Sve</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="New">Novo</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Like New">Kao novo</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Excellent">Odlično</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Very Good">
                              Vrlo dobro
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Good">Dobro</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Fair">
                              Zadovoljavajuće
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={filters.box === "full"}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                box: checked === true ? "full" : "",
                              }))
                            }
                          >
                            Sa kutijom i papirima
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={filters.verified}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                verified: checked === true,
                              }))
                            }
                          >
                            Verifikovani prodavci
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="submit" className="rounded-full sm:flex-1">
                        Primeni filtere
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full sm:flex-1"
                        onClick={handleResetFilters}
                      >
                        Resetuj
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          if (!event.target.value.trim()) {
                            setSuggestions([]);
                          }
                        }}
                        onFocus={() => setShowHistory(true)}
                        placeholder="Pretražite po marki, modelu ili referentnom broju..."
                        className="h-14 w-full rounded-2xl border-none bg-muted/50 pl-12 pr-4 text-base shadow-inner focus-visible:ring-2 focus-visible:ring-primary sm:text-lg"
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        className="rounded-full px-6"
                      >
                        Pretraži oglase
                      </Button>
                      {searchHistory.length > 0 && showHistory && (
                        <div className="flex flex-wrap gap-2 text-sm">
                          {searchHistory.map((item) => (
                            <Button
                              key={item}
                              type="button"
                              variant="outline"
                              className="rounded-full border-border/60 px-3 py-1 text-muted-foreground hover:border-primary/60 hover:text-primary"
                              onClick={() => handleHistorySelect(item)}
                            >
                              {item}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {query.length >= 2 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20">
                      <div className="rounded-2xl border border-border/60 bg-background/95 shadow-xl backdrop-blur">
                        {isLoadingSuggestions && (
                          <div className="p-4 text-sm text-muted-foreground">
                            Učitavanje predloga...
                          </div>
                        )}
                        {!isLoadingSuggestions && suggestions.length === 0 && (
                          <div className="p-4 text-sm text-muted-foreground">
                            Nema rezultata. Probajte sa drugom pretragom.
                          </div>
                        )}
                        {!isLoadingSuggestions &&
                          suggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <Watch className="h-5 w-5" aria-hidden />
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {suggestion.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {suggestion.type === "brand"
                                      ? "Marka"
                                      : `Model${suggestion.secondary ? ` • ${suggestion.secondary}` : ""}`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                {suggestion.avgPriceEurCents
                                  ? `Prosek ${formatPrice(suggestion.avgPriceEurCents)}`
                                  : null}
                                {suggestion.listingsCount ? (
                                  <div>{suggestion.listingsCount} oglasa</div>
                                ) : null}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="flex flex-wrap gap-3">
                {QUICK_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleQuickFilter(filter)}
                    className="group flex min-w-[140px] flex-1 items-center justify-between rounded-full border border-border/60 bg-background/70 px-5 py-3 text-left shadow-sm transition hover:border-primary/60 hover:bg-primary/5"
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-foreground">
                        {filter.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {filter.description}
                      </span>
                    </div>
                    <span className="ml-4 text-primary transition group-hover:translate-x-1">
                      {filter.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/70 shadow-xl">
              <div className="relative h-[380px] w-full">
                {slides.map((slide, index) => (
                  <article
                    key={slide.id}
                    className={cn(
                      "absolute inset-0 grid grid-rows-[minmax(0,1fr)_auto] gap-4 p-6 transition-opacity duration-700",
                      index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-muted">
                      {slide.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slide.photoUrl}
                          alt={`${slide.brand} ${slide.model}`}
                          className="h-full w-full object-cover"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Watch className="h-12 w-12" aria-hidden />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white">
                        <span className="font-medium">
                          {slide.brand} {slide.model}
                        </span>
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {slide.condition}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Cena</p>
                        <p className="text-xl font-semibold text-foreground">
                          {slide.priceLabel ?? "Na upit"}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="secondary"
                        className="rounded-full"
                      >
                        <Link href={`/listing/${slide.id}`}>
                          Pogledaj detalje
                          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              {hasFeatured && (
                <div className="flex items-center justify-center gap-2 pb-6">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition",
                        index === currentSlide
                          ? "bg-primary"
                          : "bg-muted-foreground/40 hover:bg-muted-foreground/70"
                      )}
                      aria-label={`Prikaži istaknutu ponudu ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 rounded-3xl border border-border/70 bg-background/70 p-6 shadow-lg backdrop-blur sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Aktivnih oglasa</p>
                <p className="text-3xl font-semibold text-foreground">
                  {totalListings.toLocaleString("sr-RS")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prodavaca u zajednici</p>
                <p className="text-3xl font-semibold text-foreground">
                  {totalSellers.toLocaleString("sr-RS")}
                </p>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" aria-hidden />
                  <span>Sačuvajte omiljene satove i pratite promene cena u realnom vremenu.</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-primary">
                  <Link href="/dashboard/wishlist">
                    Lista želja
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
