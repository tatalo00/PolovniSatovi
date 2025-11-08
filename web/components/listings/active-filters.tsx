"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveFiltersProps {
  searchParams: Record<string, string | undefined>;
}

const conditionLabels: Record<string, string> = {
  New: "Novo",
  "Like New": "Kao novo",
  Excellent: "Odlično",
  "Very Good": "Vrlo dobro",
  Good: "Dobro",
  Fair: "Zadovoljavajuće",
};

export function ActiveFilters({ searchParams }: ActiveFiltersProps) {
  const router = useRouter();
  const currentParams = useSearchParams();

  const activeFilters: Array<{ key: string; label: string; value: string }> = [];

  const q = searchParams.q ?? searchParams.search;
  const brand = searchParams.brand;
  const model = searchParams.model;
  const cond = searchParams.cond ?? searchParams.condition;
  const min = searchParams.min ?? searchParams.minPrice;
  const max = searchParams.max ?? searchParams.maxPrice;
  const loc = searchParams.loc ?? searchParams.location;
  const year = searchParams.year;

  if (q) {
    activeFilters.push({
      key: "q",
      label: "Pretraga",
      value: q,
    });
  }

  if (brand) {
    activeFilters.push({
      key: "brand",
      label: "Marka",
      value: brand,
    });
  }

  if (model) {
    activeFilters.push({
      key: "model",
      label: "Model",
      value: model,
    });
  }

  if (cond) {
    activeFilters.push({
      key: "condition",
      label: "Stanje",
      value: conditionLabels[cond] || cond,
    });
  }

  if (min || max) {
    const priceLabel =
      min && max
        ? `${min} - ${max} EUR`
        : min
        ? `Od ${min} EUR`
        : `Do ${max} EUR`;
    activeFilters.push({
      key: "price",
      label: "Cena",
      value: priceLabel,
    });
  }

  if (year) {
    activeFilters.push({
      key: "year",
      label: "Godina",
      value: year,
    });
  }

  if (loc) {
    activeFilters.push({
      key: "loc",
      label: "Lokacija",
      value: loc,
    });
  }

  const removeFilter = (keyToRemove: string) => {
    const params = new URLSearchParams(currentParams.toString());
    
    if (keyToRemove === "price") {
      params.delete("min");
      params.delete("minPrice");
      params.delete("max");
      params.delete("maxPrice");
    } else if (keyToRemove === "q") {
      params.delete("q");
      params.delete("search");
    } else if (keyToRemove === "condition") {
      params.delete("cond");
      params.delete("condition");
    } else if (keyToRemove === "loc") {
      params.delete("loc");
      params.delete("location");
    } else {
      params.delete(keyToRemove);
    }
    
    params.delete("page"); // Reset to page 1 when filter changes
    const queryString = params.toString();
    router.replace(queryString ? `/listings?${queryString}` : "/listings", {
      scroll: false,
    });
  };

  const clearAllFilters = () => {
    router.replace("/listings", { scroll: false });
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">
        Aktivni filteri ({activeFilters.length}):
      </span>
      {activeFilters.map((filter) => {
        if (filter.key === "price") {
          return (
            <Badge
              key={filter.key}
              variant="secondary"
              className="gap-1 px-2 py-1 text-sm"
            >
              <span>
                {filter.label}: {filter.value}
              </span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                aria-label={`Ukloni filter ${filter.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        }
        
        return (
          <Badge
            key={filter.key}
            variant="secondary"
            className="gap-1 px-2 py-1 text-sm"
          >
            <span>
              {filter.label}: {filter.value}
            </span>
            <button
              onClick={() => removeFilter(filter.key)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20"
              aria-label={`Ukloni filter ${filter.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearAllFilters}
        className="h-7 text-xs"
      >
        Obriši sve filtere
      </Button>
    </div>
  );
}


