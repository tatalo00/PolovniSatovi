/* eslint-disable tailwindcss/no-custom-classname */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

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

export interface QuickFilterBarProps {
  brands: string[];
}

export function QuickFilterBar({ brands }: QuickFilterBarProps) {
  const router = useRouter();

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [caseMaterials, setCaseMaterials] = useState<string[]>([]);
  const [strapMaterials, setStrapMaterials] = useState<string[]>([]);
  const [dialColors, setDialColors] = useState<string[]>([]);
  const [diameterMin, setDiameterMin] = useState("");
  const [diameterMax, setDiameterMax] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

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

    return [...primary, ...remaining, "Ostalo"].filter(
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
    const params = new URLSearchParams();

    if (selectedBrands.length) {
      const explicitBrands = selectedBrands.filter((value) => value !== "Ostalo");
      explicitBrands.forEach((value) => params.append("brand", value));
      if (selectedBrands.includes("Ostalo")) {
        params.append("brandCategory", "other");
      }
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
      selectedConditions.forEach((condition) => params.append("condition", condition));
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

    if (yearFrom) {
      params.set("yearFrom", yearFrom);
    }

    if (yearTo) {
      params.set("yearTo", yearTo);
    }

    router.push(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    selectedMovements.length > 0 ||
    selectedConditions.length > 0 ||
    caseMaterials.length > 0 ||
    strapMaterials.length > 0 ||
    dialColors.length > 0 ||
    Boolean(diameterMin) ||
    Boolean(diameterMax) ||
    Boolean(yearFrom) ||
    Boolean(yearTo);

  return (
    <section className="mt-12 px-4 text-foreground md:mt-16">
      <div className="mx-auto max-w-6xl">
        <div
          className={cn(
            "rounded-3xl border border-border/70 bg-white/85 p-6 shadow-xl backdrop-blur-md transition-all md:p-8",
            showAdvanced ? "lg:p-10" : "",
          )}
        >
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <Watch className="h-4 w-4" aria-hidden />
                <span>Marka</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-4 py-3 text-left text-base font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90"
                  >
                    <span>{brandLabel}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
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

            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Cena
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Input
                    inputMode="numeric"
                    placeholder="Min €"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-12 rounded-xl border-2 border-muted/70 bg-white/80 px-4 text-base"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    inputMode="numeric"
                    placeholder="Max €"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-12 rounded-xl border-2 border-muted/70 bg-white/80 px-4 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Mehanizam
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-4 py-3 text-left text-base font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90"
                  >
                    <span className="flex items-center gap-2">
                      {activeMovementOption?.icon}
                      <span>{movementLabel}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
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

            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Stanje
              </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-4 py-3 text-left text-base font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90"
                    >
                      <span>
                        {selectedConditions.length
                          ? `${selectedConditions.length} ${selectedConditions.length === 1 ? "stanje" : "stanja"}`
                          : "Sva stanja"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
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

            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col gap-4 lg:items-start">
                <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
                  <Button
                    className="h-12 w-full rounded-full bg-[#D4AF37] px-8 text-base font-semibold text-neutral-900 shadow-lg transition hover:bg-[#b6932c] hover:text-neutral-900 lg:w-auto lg:px-10"
                    onClick={handleSearch}
                  >
                    Pretraži
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                  >
                    {showAdvanced ? "Sakrij naprednu pretragu" : "Napredna pretraga"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrands([]);
                      setBrandSearch("");
                      setMinPrice("");
                      setMaxPrice("");
                      setSelectedMovements([]);
                      setSelectedConditions([]);
                      setCaseMaterials([]);
                      setStrapMaterials([]);
                      setDialColors([]);
                      setDiameterMin("");
                      setDiameterMax("");
                      setYearFrom("");
                      setYearTo("");
                    }}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-opacity duration-200",
                      hasActiveFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                  >
                    Resetuj filtere
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div
            className={cn(
              "transition-all duration-500 ease-in-out",
              showAdvanced ? "mt-12 max-h-[2400px] opacity-100" : "mt-0 max-h-0 opacity-0"
            )}
            aria-hidden={!showAdvanced}
          >
            <div
              className={cn(
                "space-y-8 overflow-hidden transition-opacity duration-500 ease-in-out",
                showAdvanced ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    Napredni filteri
                  </p>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Suptilno prilagodite izbor prema detaljima koji su vam važni
                  </h3>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Kombinujte završnu obradu, narukvicu, boju brojčanika i tehničke specifikacije kako biste brzo
                    suzili izbor na modele koji savršeno odgovaraju vašem stilu.
                  </p>
                </div>
                <div className="inline-flex items-center justify-center rounded-full border border-muted/60 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground shadow-sm">
                  15+ opcija filtriranja
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-muted/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      <Layers className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Materijal kućišta
                      </h4>
                      <p className="text-xs text-muted-foreground/80">
                        Odaberite završnu obradu i metal koji tražite.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {CASE_MATERIAL_OPTIONS.map((option) => {
                      const isActive = caseMaterials.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMultiSelect(option, caseMaterials, setCaseMaterials)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
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

                <div className="rounded-2xl border border-muted/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      <LinkIcon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Materijal narukvice
                      </h4>
                      <p className="text-xs text-muted-foreground/80">
                        Selektujte teksturu i stil narukvice.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {STRAP_OPTIONS.map((option) => {
                      const isActive = strapMaterials.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMultiSelect(option, strapMaterials, setStrapMaterials)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
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

                <div className="rounded-2xl border border-muted/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      <Palette className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Boja brojčanika
                      </h4>
                      <p className="text-xs text-muted-foreground/80">
                        Uskladite sat sa garderobom ili kolekcijom.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {DIAL_COLOR_OPTIONS.map((option) => {
                      const isActive = dialColors.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMultiSelect(option, dialColors, setDialColors)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
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

                <div className="rounded-2xl border border-muted/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      <Ruler className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Prečnik kućišta
                      </h4>
                      <p className="text-xs text-muted-foreground/80">
                        Precizirajte dimenzije u milimetrima.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Input
                      inputMode="numeric"
                      placeholder="Min"
                      value={diameterMin}
                      onChange={(event) => setDiameterMin(event.target.value.replace(/[^\d]/g, ""))}
                      className="h-12 rounded-xl border-2 border-muted/70 bg-white/80 px-4 text-base"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      inputMode="numeric"
                      placeholder="Max"
                      value={diameterMax}
                      onChange={(event) => setDiameterMax(event.target.value.replace(/[^\d]/g, ""))}
                      className="h-12 rounded-xl border-2 border-muted/70 bg-white/80 px-4 text-base"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-muted/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      <Calendar className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Godište / godina proizvodnje
                      </h4>
                      <p className="text-xs text-muted-foreground/80">
                        Fokusirajte se na period proizvodnje ili izdanje.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      inputMode="numeric"
                      placeholder="Od"
                      value={yearFrom}
                      onChange={(event) => setYearFrom(event.target.value.replace(/[^\d]/g, ""))}
                      className="h-12 w-full rounded-xl border-2 border-muted/70 bg-white/80 px-4 text-base sm:w-40"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      inputMode="numeric"
                      placeholder="Do"
                      value={yearTo}
                      onChange={(event) => setYearTo(event.target.value.replace(/[^\d]/g, ""))}
                      className="h-12 w-full rounded-xl border-2 border-muted/70 bg-white/80 px-4 text-base sm:w-40"
                    />
                    <p className="text-xs text-muted-foreground sm:ml-auto">
                      Savet: ostavite jedno polje prazno za otvoreni opseg.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
