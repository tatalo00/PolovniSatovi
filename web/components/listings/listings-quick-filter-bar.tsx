"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BatteryCharging,
  Calendar,
  Check,
  ChevronDown,
  GaugeCircle,
  Layers,
  Link as LinkIcon,
  Palette,
  Ruler,
  Search,
  Sparkles,
  Watch,
  X,
} from "lucide-react";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";

const FEATURED_BRANDS = ["Rolex", "Omega", "Patek Philippe", "Cartier", "Tag Heuer"] as const;

const MOVEMENT_OPTIONS = [
  { value: "automatic", label: "Automatik", icon: <GaugeCircle className="h-4 w-4" /> },
  { value: "mechanical", label: "Mehanički", icon: <Sparkles className="h-4 w-4" /> },
  { value: "quartz", label: "Kvarc", icon: <BatteryCharging className="h-4 w-4" /> },
] as const;

const CONDITION_OPTIONS = ["Novo", "Odlično", "Dobro", "Za servis"] as const;

const CASE_MATERIAL_OPTIONS = ["Čelik", "Zlato", "Titanijum", "Keramika", "Ostalo"] as const;
const STRAP_OPTIONS = ["Koža", "Metal", "Guma", "Tekstil", "Ostalo"] as const;
const DIAL_COLOR_OPTIONS = ["Crna", "Bela", "Plava", "Zelena", "Skeleton", "Ostalo"] as const;

// Map condition labels to filter values
const CONDITION_MAP: Record<string, string> = {
  Novo: "New",
  Odlično: "Excellent",
  Dobro: "Good",
  "Za servis": "Fair",
};

const CONDITION_REVERSE_MAP: Record<string, string> = {
  New: "Novo",
  Excellent: "Odlično",
  Good: "Dobro",
  Fair: "Za servis",
};

export interface ListingsQuickFilterBarProps {
  brands: string[];
}

export function ListingsQuickFilterBar({ brands }: ListingsQuickFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { start: startNavigation } = useNavigationFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize from URL params
  const urlBrands = useMemo(() => {
    const brandParam = searchParams?.get("brand");
    if (!brandParam) return [];
    return brandParam.split(",").filter(Boolean);
  }, [searchParams]);

  const urlMovements = useMemo(() => {
    const movementParam = searchParams?.get("movement");
    if (!movementParam) return [];
    return movementParam.split(",").filter(Boolean);
  }, [searchParams]);

  const urlConditions = useMemo(() => {
    const condParam = searchParams?.get("cond") || searchParams?.get("condition");
    if (!condParam) return [];
    return condParam.split(",").map(c => CONDITION_REVERSE_MAP[c] || c).filter(Boolean);
  }, [searchParams]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>(urlBrands);
  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState(searchParams?.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("max") || "");
  const [selectedMovements, setSelectedMovements] = useState<string[]>(urlMovements);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(urlConditions);
  const [modelSearch, setModelSearch] = useState(searchParams?.get("model") || "");
  const [referenceSearch, setReferenceSearch] = useState(searchParams?.get("reference") || "");
  
  // Advanced filters
  const [caseMaterials, setCaseMaterials] = useState<string[]>([]);
  const [strapMaterials, setStrapMaterials] = useState<string[]>([]);
  const [dialColors, setDialColors] = useState<string[]>([]);
  const [diameterMin, setDiameterMin] = useState("");
  const [diameterMax, setDiameterMax] = useState("");
  const [yearFrom, setYearFrom] = useState(searchParams?.get("yearFrom") || "");
  const [yearTo, setYearTo] = useState(searchParams?.get("yearTo") || "");
  const [locationSearch, setLocationSearch] = useState(searchParams?.get("loc") || searchParams?.get("location") || "");

  // Sync with URL params
  useEffect(() => {
    setSelectedBrands(urlBrands);
  }, [urlBrands]);

  useEffect(() => {
    setSelectedMovements(urlMovements);
  }, [urlMovements]);

  useEffect(() => {
    setSelectedConditions(urlConditions);
  }, [urlConditions]);

  useEffect(() => {
    setMinPrice(searchParams?.get("min") || "");
    setMaxPrice(searchParams?.get("max") || "");
    setModelSearch(searchParams?.get("model") || "");
    setReferenceSearch(searchParams?.get("reference") || "");
    setYearFrom(searchParams?.get("yearFrom") || "");
    setYearTo(searchParams?.get("yearTo") || "");
    setLocationSearch(searchParams?.get("loc") || searchParams?.get("location") || "");
  }, [searchParams]);

  const orderedBrands = useMemo(() => {
    const normalized = new Map<string, string>();
    brands.forEach((brandName) => {
      if (!brandName) return;
      const lower = brandName.toLowerCase();
      if (!normalized.has(lower)) {
        normalized.set(lower, brandName);
      }
    });

    const uniqueBrands = Array.from(normalized.values());
    const primary = FEATURED_BRANDS.filter((featured) =>
      uniqueBrands.some((item) => item.toLowerCase() === featured.toLowerCase()),
    );
    const remaining = uniqueBrands
      .filter(
        (item) => !primary.some((featured) => featured.toLowerCase() === item.toLowerCase()),
      )
      .sort((a, b) => a.localeCompare(b));

    return [...primary, ...remaining].filter(
      (value, index, array) =>
        array.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index,
    );
  }, [brands]);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    if (!query) {
      return orderedBrands;
    }
    return orderedBrands.filter((item) => item.toLowerCase().includes(query));
  }, [brandSearch, orderedBrands]);

  const brandLabel = useMemo(() => {
    if (!selectedBrands.length) {
      return "Sve marke";
    }
    if (selectedBrands.length === 1) {
      return selectedBrands[0];
    }
    return `${selectedBrands.length} marke`;
  }, [selectedBrands]);

  const activeMovementOption = useMemo(() => {
    if (selectedMovements.length === 1) {
      return MOVEMENT_OPTIONS.find((option) => option.value === selectedMovements[0]) ?? null;
    }
    return null;
  }, [selectedMovements]);

  const movementLabel = useMemo(() => {
    if (!selectedMovements.length) {
      return "Svi tipovi";
    }
    if (selectedMovements.length === 1) {
      return activeMovementOption?.label ?? "Odabrani tip";
    }
    return `${selectedMovements.length} tipa`;
  }, [activeMovementOption, selectedMovements]);

  const toggleMultiSelect = (
    value: string,
    selection: string[],
    setter: (value: string[]) => void,
  ) => {
    setter(selection.includes(value) ? selection.filter((item) => item !== value) : [...selection, value]);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    // Clear existing filter params
    [
      "brand", "model", "reference", "min", "max", "movement", "cond", "condition", 
      "loc", "location", "yearFrom", "yearTo", "caseMaterial", "strapMaterial", 
      "dialColor", "diameterMin", "diameterMax", "page"
    ].forEach(key => {
      params.delete(key);
    });

    if (selectedBrands.length) {
      selectedBrands.forEach((value) => params.append("brand", value));
    }

    if (modelSearch.trim()) {
      params.set("model", modelSearch.trim());
    }

    if (referenceSearch.trim()) {
      params.set("reference", referenceSearch.trim());
    }

    if (minPrice) {
      params.set("min", minPrice);
    }

    if (maxPrice) {
      params.set("max", maxPrice);
    }

    if (selectedMovements.length) {
      selectedMovements.forEach((value) => params.append("movement", value));
    }

    if (selectedConditions.length) {
      selectedConditions.forEach((condition) => {
        const filterValue = CONDITION_MAP[condition] || condition;
        params.append("cond", filterValue);
      });
    }

    if (locationSearch.trim()) {
      params.set("loc", locationSearch.trim());
    }

    if (yearFrom) {
      params.set("yearFrom", yearFrom);
    }

    if (yearTo) {
      params.set("yearTo", yearTo);
    }

    if (caseMaterials.length) {
      caseMaterials.forEach((material) => params.append("caseMaterial", material));
    }

    if (strapMaterials.length) {
      strapMaterials.forEach((material) => params.append("strapMaterial", material));
    }

    if (dialColors.length) {
      dialColors.forEach((color) => params.append("dialColor", color));
    }

    if (diameterMin) {
      params.set("diameterMin", diameterMin);
    }

    if (diameterMax) {
      params.set("diameterMax", diameterMax);
    }

    startNavigation({ immediate: true });
    router.push(`/listings?${params.toString()}`);
    setIsOpen(false);
  };

  const hasActiveFiltersFromUrl = useMemo(() => {
    return !!(
      searchParams?.get("brand") ||
      searchParams?.get("model") ||
      searchParams?.get("reference") ||
      searchParams?.get("min") ||
      searchParams?.get("max") ||
      searchParams?.get("movement") ||
      searchParams?.get("cond") ||
      searchParams?.get("condition") ||
      searchParams?.get("loc") ||
      searchParams?.get("location") ||
      searchParams?.get("yearFrom") ||
      searchParams?.get("yearTo") ||
      searchParams?.get("caseMaterial") ||
      searchParams?.get("strapMaterial") ||
      searchParams?.get("dialColor") ||
      searchParams?.get("diameterMin") ||
      searchParams?.get("diameterMax")
    );
  }, [searchParams]);

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    Boolean(modelSearch.trim()) ||
    Boolean(referenceSearch.trim()) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    selectedMovements.length > 0 ||
    selectedConditions.length > 0 ||
    Boolean(locationSearch.trim()) ||
    Boolean(yearFrom) ||
    Boolean(yearTo) ||
    caseMaterials.length > 0 ||
    strapMaterials.length > 0 ||
    dialColors.length > 0 ||
    Boolean(diameterMin) ||
    Boolean(diameterMax);

  if (!isOpen) {
    return (
      <div className="mb-4">
        <Button
          onClick={() => setIsOpen(true)}
          variant={hasActiveFiltersFromUrl ? "default" : "outline"}
          className="w-full sm:w-auto min-h-[44px]"
        >
          <Search className="h-4 w-4 mr-2" />
          {hasActiveFiltersFromUrl ? "Izmeni pretragu" : "Pretraži oglase"}
        </Button>
      </div>
    );
  }

  return (
    <section className="mb-6 rounded-2xl border border-border/70 bg-white/85 p-4 shadow-lg backdrop-blur-md md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pretraži oglase</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-10 w-10 min-h-[44px] min-w-[44px]"
          aria-label="Zatvori pretragu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
          {/* Brand - First */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Watch className="h-4 w-4" aria-hidden />
              <span>Marka</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 min-h-[44px] w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-3 text-left text-sm font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90"
                >
                  <span className="truncate">{brandLabel}</span>
                  <ChevronDown className="h-4 w-4 opacity-60 flex-shrink-0" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl border border-border/70 bg-background/95 p-0 shadow-xl"
                sideOffset={10}
              >
                <div className="p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <Input
                      value={brandSearch}
                      onChange={(event) => setBrandSearch(event.target.value)}
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder="Pretraži marke"
                      className="h-8 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="max-h-64 overflow-y-auto py-2">
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      setSelectedBrands([]);
                      setBrandSearch("");
                    }}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    Sve marke
                    {!selectedBrands.length && (
                      <Check className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                    )}
                  </DropdownMenuItem>
                  {filteredBrands.map((item) => (
                    <DropdownMenuCheckboxItem
                      key={item}
                      onSelect={(event) => {
                        event.preventDefault();
                      }}
                      checked={selectedBrands.includes(item)}
                      onCheckedChange={(checked) => {
                        setSelectedBrands((prev) => {
                          if (checked) {
                            if (prev.includes(item)) {
                              return prev;
                            }
                            return [...prev, item];
                          }
                          return prev.filter((value) => value !== item);
                        });
                        setBrandSearch("");
                      }}
                      className="flex items-center justify-between px-4 py-2 text-sm [&>span:first-child]:hidden"
                    >
                      <span>{item}</span>
                      {selectedBrands.includes(item) && (
                        <span className="ml-3 text-[#D4AF37]">
                          <Check className="h-4 w-4" aria-hidden />
                        </span>
                      )}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Model - Second */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Model
            </div>
            <Input
              placeholder="npr. Seamaster"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="h-11 min-h-[44px] text-sm"
            />
          </div>

          {/* Reference - Third */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Referenca
            </div>
            <Input
              placeholder="npr. 126610LN"
              value={referenceSearch}
              onChange={(e) => setReferenceSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="h-11 min-h-[44px] text-sm"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Cena
            </div>
            <div className="flex items-center gap-2">
              <Input
                inputMode="numeric"
                placeholder="Min €"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value.replace(/[^\d]/g, ""))}
                className="h-11 min-h-[44px] flex-1 rounded-xl border-2 border-muted/70 bg-white/80 px-3 text-sm"
              />
              <span className="text-muted-foreground flex-shrink-0">—</span>
              <Input
                inputMode="numeric"
                placeholder="Max €"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value.replace(/[^\d]/g, ""))}
                className="h-11 min-h-[44px] flex-1 rounded-xl border-2 border-muted/70 bg-white/80 px-3 text-sm"
              />
            </div>
          </div>

          {/* Movement */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Mehanizam
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 min-h-[44px] w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-3 text-left text-sm font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90"
                >
                  <span className="flex items-center gap-2 truncate">
                    {activeMovementOption?.icon}
                    <span className="truncate">{movementLabel}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60 flex-shrink-0" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 rounded-2xl border border-border/70 bg-background/95 p-1 shadow-xl">
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setSelectedMovements([]);
                  }}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm"
                >
                  <span>Svi tipovi</span>
                  {!selectedMovements.length && <Check className="h-4 w-4 text-[#D4AF37]" aria-hidden />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {MOVEMENT_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    onSelect={(event) => event.preventDefault()}
                    checked={selectedMovements.includes(option.value)}
                    onCheckedChange={(checked) => {
                      setSelectedMovements((prev) =>
                        checked ? [...prev, option.value] : prev.filter((value) => value !== option.value)
                      );
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm [&>span:first-child]:hidden"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-muted-foreground">{option.icon}</span>
                      {option.label}
                    </span>
                    {selectedMovements.includes(option.value) && (
                      <span className="text-[#D4AF37]">
                        <Check className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Stanje
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 min-h-[44px] w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-3 text-left text-sm font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90"
                >
                  <span className="truncate">
                    {selectedConditions.length
                      ? `${selectedConditions.length} ${selectedConditions.length === 1 ? "stanje" : "stanja"}`
                      : "Sva stanja"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60 flex-shrink-0" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 rounded-2xl border border-border/70 bg-background/95 p-1 shadow-xl">
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setSelectedConditions([]);
                  }}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm"
                >
                  <span>Sva stanja</span>
                  {!selectedConditions.length && (
                    <Check className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {CONDITION_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    onSelect={(event) => event.preventDefault()}
                    checked={selectedConditions.includes(option)}
                    onCheckedChange={(checked) => {
                      setSelectedConditions((prev) =>
                        checked ? [...prev, option] : prev.filter((value) => value !== option),
                      );
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm [&>span:first-child]:hidden"
                  >
                    <span>{option}</span>
                    {selectedConditions.includes(option) && (
                      <span className="text-[#D4AF37]">
                        <Check className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Button */}
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <div className="h-[1.5rem] hidden lg:block"></div>
            <Button
              className="h-11 min-h-[44px] w-full rounded-xl bg-[#D4AF37] text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-[#b6932c]"
              onClick={handleSearch}
            >
              Pretraži
            </Button>
          </div>
        </div>

        {/* Advanced Search Toggle */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
          >
            {showAdvanced ? "Sakrij naprednu pretragu" : "Napredna pretraga"}
          </button>
        </div>

        {/* Advanced Search Section */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out",
            showAdvanced ? "mt-6 max-h-[2400px] opacity-100" : "mt-0 max-h-0 opacity-0"
          )}
          aria-hidden={!showAdvanced}
        >
          <div
            className={cn(
              "space-y-6 overflow-hidden transition-opacity duration-500 ease-in-out",
              showAdvanced ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Location */}
              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Lokacija
                </div>
                <Input
                  placeholder="Grad ili država"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="h-11 min-h-[44px] text-sm"
                />
              </div>

              {/* Year Range */}
              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Godina proizvodnje
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    placeholder="Od"
                    value={yearFrom}
                    onChange={(event) => setYearFrom(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-11 min-h-[44px] flex-1 rounded-xl border-2 border-muted/70 bg-white/80 px-3 text-sm"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    inputMode="numeric"
                    placeholder="Do"
                    value={yearTo}
                    onChange={(event) => setYearTo(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-11 min-h-[44px] flex-1 rounded-xl border-2 border-muted/70 bg-white/80 px-3 text-sm"
                  />
                </div>
              </div>

              {/* Case Material */}
              <div className="rounded-xl border border-muted/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Materijal kućišta
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CASE_MATERIAL_OPTIONS.map((option) => {
                    const isActive = caseMaterials.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleMultiSelect(option, caseMaterials, setCaseMaterials)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors min-h-[44px]",
                          isActive
                            ? "border-[#D4AF37] bg-[#D4AF37]/15 text-foreground"
                            : "border-muted/60 bg-white/70 text-muted-foreground hover:border-[#D4AF37] hover:text-foreground",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strap Material */}
              <div className="rounded-xl border border-muted/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Materijal narukvice
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STRAP_OPTIONS.map((option) => {
                    const isActive = strapMaterials.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleMultiSelect(option, strapMaterials, setStrapMaterials)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors min-h-[44px]",
                          isActive
                            ? "border-[#D4AF37] bg-[#D4AF37]/15 text-foreground"
                            : "border-muted/60 bg-white/70 text-muted-foreground hover:border-[#D4AF37] hover:text-foreground",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dial Color */}
              <div className="rounded-xl border border-muted/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Boja brojčanika
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIAL_COLOR_OPTIONS.map((option) => {
                    const isActive = dialColors.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleMultiSelect(option, dialColors, setDialColors)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors min-h-[44px]",
                          isActive
                            ? "border-[#D4AF37] bg-[#D4AF37]/15 text-foreground"
                            : "border-muted/60 bg-white/70 text-muted-foreground hover:border-[#D4AF37] hover:text-foreground",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Case Diameter */}
              <div className="rounded-xl border border-muted/60 bg-white/80 p-4 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Prečnik kućišta (mm)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    placeholder="Min"
                    value={diameterMin}
                    onChange={(event) => setDiameterMin(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-11 min-h-[44px] flex-1 rounded-xl border-2 border-muted/70 bg-white/80 px-3 text-sm"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    inputMode="numeric"
                    placeholder="Max"
                    value={diameterMax}
                    onChange={(event) => setDiameterMax(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-11 min-h-[44px] flex-1 rounded-xl border-2 border-muted/70 bg-white/80 px-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedBrands([]);
                setModelSearch("");
                setReferenceSearch("");
                setMinPrice("");
                setMaxPrice("");
                setSelectedMovements([]);
                setSelectedConditions([]);
                setLocationSearch("");
                setYearFrom("");
                setYearTo("");
                setCaseMaterials([]);
                setStrapMaterials([]);
                setDialColors([]);
                setDiameterMin("");
                setDiameterMax("");
                startNavigation({ immediate: true });
                router.push("/listings");
                setIsOpen(false);
              }}
              className="text-xs"
            >
              Obriši filtere
            </Button>
            <span className="text-xs text-muted-foreground">
              {selectedBrands.length + selectedMovements.length + selectedConditions.length + 
               (modelSearch ? 1 : 0) + (referenceSearch ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) +
               (locationSearch ? 1 : 0) + (yearFrom || yearTo ? 1 : 0) +
               caseMaterials.length + strapMaterials.length + dialColors.length +
               (diameterMin || diameterMax ? 1 : 0)} aktivnih filtera
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
