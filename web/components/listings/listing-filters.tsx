"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";
import { cn } from "@/lib/utils";

const CONDITION_MULTI_OPTIONS = [
  { value: "New", label: "Novo" },
  { value: "Excellent", label: "Odlično" },
  { value: "Good", label: "Dobro" },
  { value: "Fair", label: "Za servis" },
];

const MOVEMENT_MULTI_OPTIONS = [
  { value: "Automatic", label: "Automatski" },
  { value: "Manual", label: "Mehanički" },
  { value: "Quartz", label: "Kvarcni" },
];

const GENDER_MULTI_OPTIONS = [
  { value: "MALE", label: "Muški" },
  { value: "FEMALE", label: "Ženski" },
  { value: "UNISEX", label: "Uniseks" },
];

const EXTRA_OPTIONS = [
  { value: "BOX", label: "Kutija" },
  { value: "PAPERS", label: "Papiri" },
  { value: "BOTH", label: "Kutija i papiri" },
  { value: "NONE", label: "Ništa" },
];

const FILTER_KEYS = [
  "q",
  "brand",
  "model",
  "min",
  "max",
  "year",
  "yearFrom",
  "yearTo",
  "cond",
  "movement",
  "loc",
  "gender",
  "box",
  "verified",
  "authenticated",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

type FilterState = Record<FilterKey, string>;

const emptyFilters: FilterState = {
  q: "",
  brand: "",
  model: "",
  min: "",
  max: "",
  year: "",
  yearFrom: "",
  yearTo: "",
  cond: "",
  movement: "",
  loc: "",
  gender: "",
  box: "",
  verified: "",
  authenticated: "",
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

const splitMulti = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const joinMulti = (values: string[]): string =>
  values
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(",");

const parseFiltersFromRecord = (
  params: Record<string, string | undefined>
): FilterState => ({
  q: params.q ?? params.search ?? "",
  brand: params.brand ?? "",
  model: params.model ?? "",
  min: params.min ?? params.minPrice ?? "",
  max: params.max ?? params.maxPrice ?? "",
  year: params.year ?? "",
  yearFrom: params.yearFrom ?? "",
  yearTo: params.yearTo ?? "",
  cond: params.cond ?? params.condition ?? "",
  movement: params.movement ?? "",
  loc: params.loc ?? params.location ?? "",
  gender: params.gender ?? "",
  box: params.box ?? "",
  verified: params.verified ?? "",
  authenticated: params.authenticated ?? "",
});

const parseFiltersFromUrl = (
  params: URLSearchParams,
): FilterState => ({
  q: params.get("q") ?? params.get("search") ?? "",
  brand: params.get("brand") ?? "",
  model: params.get("model") ?? "",
  min: params.get("min") ?? params.get("minPrice") ?? "",
  max: params.get("max") ?? params.get("maxPrice") ?? "",
  year: params.get("year") ?? "",
  yearFrom: params.get("yearFrom") ?? "",
  yearTo: params.get("yearTo") ?? "",
  cond: params.get("cond") ?? params.get("condition") ?? "",
  movement: params.get("movement") ?? "",
  loc: params.get("loc") ?? params.get("location") ?? "",
  gender: params.get("gender") ?? "",
  box: params.get("box") ?? "",
  verified: params.get("verified") ?? "",
  authenticated: params.get("authenticated") ?? "",
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
  const { start: startNavigation } = useNavigationFeedback();
  const currentParams = useSearchParams();
  const currentParamsString = currentParams?.toString() ?? "";

  const initialFilters = useMemo(
    () => parseFiltersFromRecord(searchParams),
    [searchParams]
  );

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [urlFilters, setUrlFilters] = useState<FilterState>(initialFilters);

  const [brandOptions, setBrandOptions] = useState<string[]>(uniqueList(popularBrands));
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadBrands = async () => {
      try {
        setBrandLoading(true);
        const response = await fetch("/api/listings/suggest?type=brand&q=", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Greška pri učitavanju marki satova");
        }

        const data = (await response.json()) as string[];
        if (!isActive) return;

        setBrandOptions((prev) => uniqueList([...prev, ...popularBrands, ...data]));
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("Neuspešno učitavanje marki", error);
      } finally {
        if (isActive) {
          setBrandLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [popularBrands]);

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
        "yearFrom",
        "yearTo",
        "cond",
        "condition",
        "movement",
        "loc",
        "location",
        "gender",
        "box",
        "verified",
        "authenticated",
        "page",
      ].forEach((key) => params.delete(key));

      if (filtersToApply.q) params.set("q", filtersToApply.q);
      if (filtersToApply.brand) params.set("brand", filtersToApply.brand);
      if (filtersToApply.model) params.set("model", filtersToApply.model);
      if (filtersToApply.min) params.set("min", filtersToApply.min);
      if (filtersToApply.max) params.set("max", filtersToApply.max);
      if (filtersToApply.year) params.set("year", filtersToApply.year);
      if (filtersToApply.yearFrom) params.set("yearFrom", filtersToApply.yearFrom);
      if (filtersToApply.yearTo) params.set("yearTo", filtersToApply.yearTo);
      if (filtersToApply.cond) params.set("cond", filtersToApply.cond);
      if (filtersToApply.movement) params.set("movement", filtersToApply.movement);
      if (filtersToApply.loc) params.set("loc", filtersToApply.loc);
      if (filtersToApply.gender) params.set("gender", filtersToApply.gender);
      if (filtersToApply.box) params.set("box", filtersToApply.box);
      if (filtersToApply.verified) params.set("verified", filtersToApply.verified);
      if (filtersToApply.authenticated) params.set("authenticated", filtersToApply.authenticated);

      const queryString = params.toString();
      setFilters(filtersToApply);
      setUrlFilters(filtersToApply);
      startNavigation({ immediate: true });
      router.replace(queryString ? `/listings?${queryString}` : "/listings", {
        scroll: false,
      });
    },
    [currentParamsString, filters, router, startNavigation]
  );

  const clearFilters = useCallback(() => {
    setFilters(emptyFilters);
    setUrlFilters(emptyFilters);
    setBrandOptions(uniqueList(popularBrands));
    setBrandSearchTerm("");
    startNavigation({ immediate: true });
    router.replace("/listings", { scroll: false });
  }, [router, startNavigation, popularBrands]);

  const selectedBrands = useMemo(() => splitMulti(filters.brand), [filters.brand]);
  const selectedConditions = useMemo(() => {
    const raw = splitMulti(filters.cond);
    return CONDITION_MULTI_OPTIONS.map((option) => option.value).filter((value) =>
      raw.includes(value)
    );
  }, [filters.cond]);
  const selectedMovements = useMemo(() => {
    const raw = splitMulti(filters.movement);
    return MOVEMENT_MULTI_OPTIONS.map((option) => option.value).filter((value) =>
      raw.includes(value)
    );
  }, [filters.movement]);
  const selectedGenders = useMemo(() => {
    const raw = splitMulti(filters.gender);
    return GENDER_MULTI_OPTIONS.map((option) => option.value).filter((value) =>
      raw.includes(value)
    );
  }, [filters.gender]);
  const selectedExtras = useMemo(() => {
    const raw = splitMulti(filters.box);
    return EXTRA_OPTIONS.map((option) => option.value).filter((value) => raw.includes(value));
  }, [filters.box]);

  const brandList = useMemo(() => {
    const base = uniqueList([...brandOptions, ...popularBrands]).sort((a, b) =>
      a.localeCompare(b, "sr", { sensitivity: "base" })
    );
    selectedBrands.forEach((brand) => {
      if (!base.includes(brand)) {
        base.push(brand);
      }
    });
    const term = brandSearchTerm.trim().toLowerCase();
    if (term) {
      return base.filter((brand) => brand.toLowerCase().includes(term)).slice(0, 300);
    }
    return base.slice(0, 300);
  }, [brandOptions, popularBrands, selectedBrands, brandSearchTerm]);

  const toggleValue = (values: string[], value: string, shouldAdd: boolean) => {
    const next = new Set(values);
    if (shouldAdd) {
      next.add(value);
    } else {
      next.delete(value);
    }
    return Array.from(next);
  };

  const toggleBrand = (brand: string, checked: boolean) => {
    const nextValues = toggleValue(selectedBrands, brand, checked);
    setFilters((prev) => ({ ...prev, brand: joinMulti(nextValues) }));
  };

  const clearBrands = () => {
    setFilters((prev) => ({ ...prev, brand: "" }));
  };

  const toggleCondition = (value: string, checked: boolean) => {
    const nextValues = toggleValue(selectedConditions, value, checked);
    setFilters((prev) => ({ ...prev, cond: joinMulti(nextValues) }));
  };

  const toggleMovement = (value: string, checked: boolean) => {
    const nextValues = toggleValue(selectedMovements, value, checked);
    setFilters((prev) => ({ ...prev, movement: joinMulti(nextValues) }));
  };

  const toggleExtra = (value: string, checked: boolean) => {
    const nextValues = toggleValue(selectedExtras, value, checked);
    setFilters((prev) => ({ ...prev, box: joinMulti(nextValues) }));
  };

  const toggleGender = (value: string, checked: boolean) => {
    const nextValues = new Set(selectedGenders);

    if (checked) {
      nextValues.add(value);
      if ((value === "MALE" || value === "FEMALE") && !nextValues.has("UNISEX")) {
        nextValues.add("UNISEX");
      }
    } else {
      nextValues.delete(value);
      if (value === "UNISEX" && (nextValues.has("MALE") || nextValues.has("FEMALE"))) {
        nextValues.add("UNISEX");
      }
      if ((value === "MALE" || value === "FEMALE") && !nextValues.has("MALE") && !nextValues.has("FEMALE")) {
        nextValues.delete("UNISEX");
      }
    }

    const ordered = GENDER_MULTI_OPTIONS.map((option) => option.value).filter((optionValue) =>
      nextValues.has(optionValue)
    );

    setFilters((prev) => ({ ...prev, gender: joinMulti(ordered) }));
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const isDirty = !areFiltersEqual(filters, urlFilters);
  const hasActiveFilters = FILTER_KEYS.some((key) => urlFilters[key]?.length);
  const showClear = hasActiveFilters || isDirty;

  const verifiedActive = filters.verified === "1";
  const authenticatedActive = filters.authenticated === "1";

  return (
    <Card className="rounded-2xl border border-neutral-200/70 bg-white/85 shadow-lg backdrop-blur-md">
      <CardHeader className="px-5 pb-0 pt-5">
        <CardTitle className="text-xl font-semibold text-neutral-900">
          Filtrirajte oglase
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6 pt-5">
        <form onSubmit={onFormSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="listings-search" className="text-xs font-medium text-neutral-600">
              Pretraga
            </Label>
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
              className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-600">Brend</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-between rounded-xl border-neutral-200 bg-white/90 px-3 text-sm font-medium text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                >
                  <span>
                    {selectedBrands.length
                      ? `${selectedBrands.length} ${selectedBrands.length === 1 ? "brend" : "brenda"}`
                      : "Odaberi brend"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[240px] rounded-2xl border border-neutral-200/70 bg-white/95 p-0 shadow-xl"
              >
                <div className="p-3">
                  <Input
                    placeholder="Pretraži brendove"
                    value={brandSearchTerm}
                    onChange={(event) => setBrandSearchTerm(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="h-8 rounded-lg border-neutral-200 bg-white/90 text-xs text-neutral-800 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
                <DropdownMenuSeparator className="bg-neutral-200/60" />
                <div className="max-h-56 overflow-y-auto py-1 text-sm text-neutral-700">
                  {brandLoading ? (
                    <DropdownMenuItem disabled className="text-neutral-500">
                      Učitavanje...
                    </DropdownMenuItem>
                  ) : brandList.length ? (
                    brandList.map((brand) => {
                      const checked = selectedBrands.includes(brand);
                      return (
                        <DropdownMenuCheckboxItem
                          key={brand}
                          checked={checked}
                          onCheckedChange={(value) => toggleBrand(brand, value === true)}
                          onSelect={(event) => event.preventDefault()}
                          className="flex cursor-pointer items-center justify-between px-4 py-2 text-neutral-700 hover:bg-neutral-100 [&>span:first-child]:hidden"
                        >
                          <span>{brand}</span>
                          {checked && (
                            <span className="text-[#D4AF37]">
                              <Check className="h-4 w-4" aria-hidden />
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })
                  ) : (
                    <DropdownMenuItem disabled className="text-neutral-500">
                      Nema rezultata
                    </DropdownMenuItem>
                  )}
                </div>
                {selectedBrands.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-neutral-200/60" />
                    <div className="px-3 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearBrands}
                        className="h-8 w-full rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        Očisti izbor
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listings-model" className="text-xs font-medium text-neutral-600">
              Model
            </Label>
            <Input
              id="listings-model"
              placeholder="npr. Seamaster"
              value={filters.model}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, model: event.target.value }))
              }
              className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>

          <div className="grid gap-4 border-t border-neutral-200/70 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-600">Cena od (EUR)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Min"
                  value={filters.min}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, min: event.target.value }))
                  }
                  className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-600">Cena do (EUR)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Max"
                  value={filters.max}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, max: event.target.value }))
                  }
                  className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-600">Godina od</Label>
                <Input
                  inputMode="numeric"
                  placeholder="npr. 1995"
                  value={filters.yearFrom}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, yearFrom: event.target.value.replace(/[^0-9]/g, "") }))
                  }
                  className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-600">Godina do</Label>
                <Input
                  inputMode="numeric"
                  placeholder="npr. 2024"
                  value={filters.yearTo}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, yearTo: event.target.value.replace(/[^0-9]/g, "") }))
                  }
                  className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Lokacija</Label>
              <Input
                id="listings-location"
                placeholder="Grad ili država"
                value={filters.loc}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, loc: event.target.value }))
                }
                className="h-10 rounded-xl border-neutral-200 bg-white/90 text-sm text-neutral-900 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid gap-4 border-t border-neutral-200/70 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Stanje</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl border-neutral-200 bg-white/90 px-3 text-sm font-medium text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                  >
                    <span>
                      {selectedConditions.length
                        ? `${selectedConditions.length} odabrano`
                        : "Sve"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[240px] rounded-2xl border border-neutral-200/70 bg-white/95 p-0 shadow-xl"
                >
                  <div className="max-h-56 overflow-y-auto py-1 text-sm text-neutral-700">
                    {CONDITION_MULTI_OPTIONS.map((option) => {
                      const checked = selectedConditions.includes(option.value);
                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={checked}
                          onCheckedChange={(value) => toggleCondition(option.value, value === true)}
                          onSelect={(event) => event.preventDefault()}
                          className="flex cursor-pointer items-center justify-between px-4 py-2 text-neutral-700 hover:bg-neutral-100 [&>span:first-child]:hidden"
                        >
                          <span>{option.label}</span>
                          {checked && (
                            <span className="text-[#D4AF37]">
                              <Check className="h-4 w-4" aria-hidden />
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Mehanizam</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl border-neutral-200 bg-white/90 px-3 text-sm font-medium text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                  >
                    <span>
                      {selectedMovements.length
                        ? `${selectedMovements.length} odabrano`
                        : "Svi"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[240px] rounded-2xl border border-neutral-200/70 bg-white/95 p-0 shadow-xl"
                >
                  <div className="max-h-56 overflow-y-auto py-1 text-sm text-neutral-700">
                    {MOVEMENT_MULTI_OPTIONS.map((option) => {
                      const checked = selectedMovements.includes(option.value);
                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={checked}
                          onCheckedChange={(value) => toggleMovement(option.value, value === true)}
                          onSelect={(event) => event.preventDefault()}
                          className="flex cursor-pointer items-center justify-between px-4 py-2 text-neutral-700 hover:bg-neutral-100 [&>span:first-child]:hidden"
                        >
                          <span>{option.label}</span>
                          {checked && (
                            <span className="text-[#D4AF37]">
                              <Check className="h-4 w-4" aria-hidden />
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Namenjeno</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl border-neutral-200 bg-white/90 px-3 text-sm font-medium text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                  >
                    <span>
                      {selectedGenders.length ? `${selectedGenders.length} odabrano` : "Svi"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[240px] rounded-2xl border border-neutral-200/70 bg-white/95 p-0 shadow-xl"
                >
                  <div className="max-h-56 overflow-y-auto py-1 text-sm text-neutral-700">
                    {GENDER_MULTI_OPTIONS.map((option) => {
                      const checked = selectedGenders.includes(option.value);
                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={checked}
                          onCheckedChange={(value) => toggleGender(option.value, value === true)}
                          onSelect={(event) => event.preventDefault()}
                          className="flex cursor-pointer items-center justify-between px-4 py-2 text-neutral-700 hover:bg-neutral-100 [&>span:first-child]:hidden"
                        >
                          <span>{option.label}</span>
                          {checked && (
                            <span className="text-[#D4AF37]">
                              <Check className="h-4 w-4" aria-hidden />
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-4 border-t border-neutral-200/70 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Dodatno</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl border-neutral-200 bg-white/90 px-3 text-sm font-medium text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                  >
                    <span>
                      {selectedExtras.length
                        ? `${selectedExtras.length} odabrano`
                        : "Odaberi"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[240px] rounded-2xl border border-neutral-200/70 bg-white/95 p-0 shadow-xl"
                >
                  <div className="max-h-56 overflow-y-auto py-1 text-sm text-neutral-700">
                    {EXTRA_OPTIONS.map((option) => {
                      const checked = selectedExtras.includes(option.value);
                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={checked}
                          onCheckedChange={(value) => toggleExtra(option.value, value === true)}
                          onSelect={(event) => event.preventDefault()}
                          className="flex cursor-pointer items-center justify-between px-4 py-2 text-neutral-700 hover:bg-neutral-100 [&>span:first-child]:hidden"
                        >
                          <span>{option.label}</span>
                          {checked && (
                            <span className="text-[#D4AF37]">
                              <Check className="h-4 w-4" aria-hidden />
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid gap-2.5 pt-2">
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-700">Verifikovani prodavci</p>
                    <p className="text-[11px] text-neutral-500">
                      Prikaži samo prodavce koji su prošli našu verifikaciju.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        verified: prev.verified === "1" ? "" : "1",
                      }))
                    }
                    className={cn(
                      "h-8 rounded-lg border-neutral-300 px-3 text-xs font-semibold",
                      verifiedActive
                        ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white"
                        : "text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                    )}
                  >
                    {verifiedActive ? "Aktivno" : "Uključi"}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-700">Autentifikovani korisnici</p>
                    <p className="text-[11px] text-neutral-500">
                      Prikaži samo oglase korisnika sa potvrđenom email adresom.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        authenticated: prev.authenticated === "1" ? "" : "1",
                      }))
                    }
                    className={cn(
                      "h-8 rounded-lg border-neutral-300 px-3 text-xs font-semibold",
                      authenticatedActive
                        ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white"
                        : "text-neutral-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-neutral-900"
                    )}
                  >
                    {authenticatedActive ? "Aktivno" : "Uključi"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 border-t border-neutral-200/70 pt-3">
            <Button
              type="submit"
              className="h-10 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isDirty}
            >
              Primeni filtere
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-10 w-full rounded-xl text-sm font-semibold text-neutral-600 transition hover:text-neutral-900",
                showClear ? "opacity-100" : "opacity-40 pointer-events-none"
              )}
              onClick={clearFilters}
            >
              Obriši sve filtere
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}