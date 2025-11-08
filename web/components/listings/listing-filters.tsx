"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONDITION_OPTIONS = [
  { value: "all", label: "Sve" },
  { value: "New", label: "Novo" },
  { value: "Like New", label: "Kao novo" },
  { value: "Excellent", label: "Odlično" },
  { value: "Very Good", label: "Vrlo dobro" },
  { value: "Good", label: "Dobro" },
  { value: "Fair", label: "Zadovoljavajuće" },
];

const FILTER_KEYS = ["q", "brand", "model", "min", "max", "year", "cond", "loc"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

type FilterState = Record<FilterKey, string>;

const emptyFilters: FilterState = {
  q: "",
  brand: "",
  model: "",
  min: "",
  max: "",
  year: "",
  cond: "",
  loc: "",
};

interface ListingFiltersProps {
  popularBrands: string[];
  searchParams: Record<string, string | undefined>;
}

const uniqueList = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value && value.length > 0))
    )
  );

const parseFiltersFromRecord = (
  params: Record<string, string | undefined>
): FilterState => ({
  q: params.q ?? params.search ?? "",
  brand: params.brand ?? "",
  model: params.model ?? "",
  min: params.min ?? params.minPrice ?? "",
  max: params.max ?? params.maxPrice ?? "",
  year: params.year ?? "",
  cond: params.cond ?? params.condition ?? "",
  loc: params.loc ?? params.location ?? "",
});

const parseFiltersFromUrl = (params: ReadonlyURLSearchParams): FilterState => ({
  q: params.get("q") ?? params.get("search") ?? "",
  brand: params.get("brand") ?? "",
  model: params.get("model") ?? "",
  min: params.get("min") ?? params.get("minPrice") ?? "",
  max: params.get("max") ?? params.get("maxPrice") ?? "",
  year: params.get("year") ?? "",
  cond: params.get("cond") ?? params.get("condition") ?? "",
  loc: params.get("loc") ?? params.get("location") ?? "",
});

const areFiltersEqual = (a: FilterState, b: FilterState) =>
  FILTER_KEYS.every((key) => (a[key] ?? "") === (b[key] ?? ""));

const sanitizeFilters = (state: FilterState): FilterState => {
  const sanitized: FilterState = { ...emptyFilters };
  FILTER_KEYS.forEach((key) => {
    sanitized[key] = state[key]?.trim() ?? "";
  });
  return sanitized;
};

export function ListingFilters({ popularBrands, searchParams }: ListingFiltersProps) {
  const router = useRouter();
  const currentParams = useSearchParams();
  const currentParamsString = currentParams.toString();

  const initialFilters = useMemo(
    () => parseFiltersFromRecord(searchParams),
    [searchParams]
  );

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [urlFilters, setUrlFilters] = useState<FilterState>(initialFilters);

  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  const brandAbortRef = useRef<AbortController | null>(null);
  const modelAbortRef = useRef<AbortController | null>(null);
  const brandBlurTimeout = useRef<NodeJS.Timeout | null>(null);
  const modelBlurTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const nextFilters = parseFiltersFromUrl(currentParams);
    setFilters(nextFilters);
    setUrlFilters(nextFilters);
  }, [currentParams, currentParamsString]);

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
        const data: string[] = await response.json();
        setBrandSuggestions(uniqueList(data));
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Brand suggestions error:", error);
        }
      } finally {
        setBrandLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters.brand]);

  useEffect(() => {
    const query = filters.model.trim();

    if (query.length < 2) {
      modelAbortRef.current?.abort();
      setModelSuggestions([]);
      setModelLoading(false);
      return;
    }

    setModelLoading(true);
    const controller = new AbortController();
    modelAbortRef.current?.abort();
    modelAbortRef.current = controller;

    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          type: "model",
          q: query,
        });
        if (filters.brand.trim()) {
          params.set("brand", filters.brand.trim());
        }

        const response = await fetch(`/api/listings/suggest?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch model suggestions");
        }
        const data: string[] = await response.json();
        setModelSuggestions(uniqueList(data));
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Model suggestions error:", error);
        }
      } finally {
        setModelLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters.model, filters.brand]);

  useEffect(
    () => () => {
      brandAbortRef.current?.abort();
      modelAbortRef.current?.abort();
      if (brandBlurTimeout.current) {
        clearTimeout(brandBlurTimeout.current);
      }
      if (modelBlurTimeout.current) {
        clearTimeout(modelBlurTimeout.current);
      }
    },
    []
  );

  const applyFilters = useCallback(
    (nextState?: FilterState) => {
      const filtersToApply = sanitizeFilters(nextState ?? filters);
      const params = new URLSearchParams(currentParamsString);

      [
        "q",
        "search",
        "brand",
        "model",
        "min",
        "minPrice",
        "max",
        "maxPrice",
        "year",
        "cond",
        "condition",
        "loc",
        "location",
        "page",
      ].forEach((key) => params.delete(key));

      if (filtersToApply.q) params.set("q", filtersToApply.q);
      if (filtersToApply.brand) params.set("brand", filtersToApply.brand);
      if (filtersToApply.model) params.set("model", filtersToApply.model);
      if (filtersToApply.min) params.set("min", filtersToApply.min);
      if (filtersToApply.max) params.set("max", filtersToApply.max);
      if (filtersToApply.year) params.set("year", filtersToApply.year);
      if (filtersToApply.cond) params.set("cond", filtersToApply.cond);
      if (filtersToApply.loc) params.set("loc", filtersToApply.loc);

      const queryString = params.toString();
      setFilters(filtersToApply);
      setUrlFilters(filtersToApply);
      router.replace(queryString ? `/listings?${queryString}` : "/listings", {
        scroll: false,
      });
    },
    [currentParamsString, filters, router]
  );

  const clearFilters = useCallback(() => {
    setFilters(emptyFilters);
    setUrlFilters(emptyFilters);
    router.replace("/listings", { scroll: false });
  }, [router]);

  const handleBrandFocus = () => {
    if (brandBlurTimeout.current) {
      clearTimeout(brandBlurTimeout.current);
    }
    setBrandOpen(true);
  };

  const handleBrandBlur = () => {
    brandBlurTimeout.current = setTimeout(() => setBrandOpen(false), 120);
  };

  const handleModelFocus = () => {
    if (modelBlurTimeout.current) {
      clearTimeout(modelBlurTimeout.current);
    }
    setModelOpen(true);
  };

  const handleModelBlur = () => {
    modelBlurTimeout.current = setTimeout(() => setModelOpen(false), 120);
  };

  const handleBrandSelect = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const next: FilterState = {
      ...filters,
      brand: trimmed,
      model:
        filters.brand.trim().toLowerCase() === trimmed.toLowerCase()
          ? filters.model
          : "",
    };
    setFilters(next);
    setBrandOpen(false);
    applyFilters(next);
  };

  const handleModelSelect = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const next: FilterState = {
      ...filters,
      model: trimmed,
    };
    setFilters(next);
    setModelOpen(false);
    applyFilters(next);
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const isDirty = !areFiltersEqual(filters, urlFilters);
  const hasActiveFilters = FILTER_KEYS.some((key) => urlFilters[key]?.length);
  const showClear = hasActiveFilters || isDirty;

  const brandQuickPicks = useMemo(
    () => uniqueList(popularBrands).slice(0, 10),
    [popularBrands]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filteri</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listings-search">Pretraga</Label>
            <Input
              id="listings-search"
              placeholder="Naziv, model ili referenca"
              value={filters.q}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, q: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyFilters();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listings-brand">Marka</Label>
            <div className="relative">
              <Input
                id="listings-brand"
                placeholder="npr. Omega"
                value={filters.brand}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, brand: event.target.value }))
                }
                onFocus={handleBrandFocus}
                onBlur={handleBrandBlur}
                autoComplete="off"
              />
              {brandOpen && (
                <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border bg-popover shadow-lg">
                  {filters.brand.trim().length < 2 ? (
                    <div className="space-y-2 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Popularne marke
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {brandQuickPicks.length > 0 ? (
                          brandQuickPicks.map((brand) => (
                            <button
                              type="button"
                              key={brand}
                              className="rounded-full border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleBrandSelect(brand);
                              }}
                            >
                              {brand}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Nema dostupnih marki
                          </span>
                        )}
                      </div>
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

          <div className="space-y-2">
            <Label htmlFor="listings-model">Model</Label>
            <div className="relative">
              <Input
                id="listings-model"
                placeholder="npr. Seamaster"
                value={filters.model}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, model: event.target.value }))
                }
                onFocus={handleModelFocus}
                onBlur={handleModelBlur}
                autoComplete="off"
              />
              {modelOpen && (
                <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border bg-popover shadow-lg">
                  {filters.model.trim().length < 2 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Unesite bar dva slova za sugestije modela.
                    </div>
                  ) : (
                    <ul className="max-h-56 overflow-y-auto py-1 text-sm">
                      {modelLoading ? (
                        <li className="px-3 py-2 text-muted-foreground">
                          Pretraga...
                        </li>
                      ) : modelSuggestions.length > 0 ? (
                        modelSuggestions.map((suggestion) => (
                          <li key={suggestion}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleModelSelect(suggestion);
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

          <div className="space-y-2">
            <Label htmlFor="listings-condition">Stanje</Label>
            <Select
              value={filters.cond || "all"}
              onValueChange={(value) => {
                const normalized = value === "all" ? "" : value;
                const next: FilterState = { ...filters, cond: normalized };
                setFilters(next);
                applyFilters(next);
              }}
            >
              <SelectTrigger id="listings-condition">
                <SelectValue placeholder="Sve" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cena (EUR)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Min"
                value={filters.min}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, min: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyFilters();
                  }
                }}
              />
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Max"
                value={filters.max}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, max: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyFilters();
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listings-year">Godina</Label>
            <Input
              id="listings-year"
              type="number"
              inputMode="numeric"
              placeholder="npr. 2018"
              value={filters.year}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, year: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyFilters();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listings-location">Lokacija</Label>
            <Input
              id="listings-location"
              placeholder="Grad ili država"
              value={filters.loc}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, loc: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyFilters();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={!isDirty}>
              Primeni filtere
            </Button>
            {showClear && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Obriši sve filtere
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}