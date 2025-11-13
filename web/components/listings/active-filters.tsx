"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";

interface ActiveFiltersProps {
  searchParams: Record<string, string | undefined>;
}

const conditionLabels: Record<string, string> = {
  New: "Novo",
  Excellent: "Odlično",
  Good: "Dobro",
  Fair: "Za servis",
};

const genderLabels: Record<string, string> = {
  MALE: "Muški",
  FEMALE: "Ženski",
  UNISEX: "Uniseks",
};

const boxLabels: Record<string, string> = {
  full: "Sa kutijom i papirima",
};

const movementLabels: Record<string, string> = {
  Automatic: "Automatski",
  Manual: "Mehanički (ručno)",
  Quartz: "Kvarcni",
  automatic: "Automatik",
  mechanical: "Mehanički",
  quartz: "Kvarc",
};

export function ActiveFilters({ searchParams }: ActiveFiltersProps) {
  const router = useRouter();
  const currentParams = useSearchParams();
  const currentParamsString = currentParams?.toString() ?? "";
  const { start: startNavigation } = useNavigationFeedback();

  const activeFilters = useMemo(() => {
    const result: Array<{ key: string; label: string; value: string; rawValue?: string }> = [];

    const params = new URLSearchParams(currentParamsString);

    const getValues = (key: string): string[] => {
      const values = params.getAll(key);
      if (values.length) return values;
      const fallback = searchParams[key as keyof typeof searchParams];
      if (!fallback) return [];
      return fallback
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    };

    const q = searchParams.q ?? searchParams.search;
    const brandValues = getValues("brand");
    const model = searchParams.model;
    const conditionValues = getValues("condition").concat(getValues("cond"));
    const min = searchParams.min ?? searchParams.minPrice;
    const max = searchParams.max ?? searchParams.maxPrice;
    const loc = searchParams.loc ?? searchParams.location;
    const year = searchParams.year;
    const gender = searchParams.gender;
    const box = searchParams.box;
    const verified = searchParams.verified;
    const movementValues = getValues("movement");

    if (q) {
      result.push({
        key: "q",
        label: "Pretraga",
        value: q,
      });
    }

    if (brandValues.length) {
      brandValues.forEach((value, index) => {
        result.push({
          key: `brand`,
          label: "Marka",
          value,
          rawValue: value,
        });
      });
    }

    if (model) {
      result.push({
        key: "model",
        label: "Model",
        value: model,
      });
    }

    if (conditionValues.length) {
      conditionValues.forEach((value) => {
        result.push({
          key: "condition",
          label: "Stanje",
          value: conditionLabels[value] || value,
          rawValue: value,
        });
      });
    }

    if (min || max) {
      const priceLabel =
        min && max
          ? `${min} - ${max} EUR`
          : min
          ? `Od ${min} EUR`
          : `Do ${max} EUR`;
      result.push({
        key: "price",
        label: "Cena",
        value: priceLabel,
      });
    }

    if (year) {
      result.push({
        key: "year",
        label: "Godina",
        value: year,
      });
    }

    if (loc) {
      result.push({
        key: "loc",
        label: "Lokacija",
        value: loc,
      });
    }

    if (movementValues.length) {
      movementValues.forEach((value) => {
        result.push({
          key: "movement",
          label: "Mehanizam",
          value: movementLabels[value] ?? value,
          rawValue: value,
        });
      });
    }

    if (gender) {
      const normalized = gender.toLowerCase();
      result.push({
        key: "gender",
        label: "Namenjeno",
        value: genderLabels[normalized] ?? gender,
      });
    }

    if (box) {
      const normalized = box.toLowerCase();
      result.push({
        key: "box",
        label: "Dodatni uslovi",
        value: boxLabels[normalized] ?? "Sa kutijom i papirima",
      });
    }

    if (verified) {
      const normalized = verified.toLowerCase();
      if (["1", "true", "yes"].includes(normalized)) {
        result.push({
          key: "verified",
          label: "Prodavac",
          value: "Verifikovani",
        });
      }
    }

    return result;
  }, [currentParamsString, searchParams]);

  const removeFilter = useCallback(
    (keyToRemove: string, valueToRemove?: string) => {
      const params = new URLSearchParams(currentParamsString);
    
      const deleteMultiValue = (key: string, targetValue?: string) => {
        if (!targetValue) {
          params.delete(key);
          return;
        }
        const values = params.getAll(key);
        if (!values.length) return;
        params.delete(key);
        values
          .filter((value) => value !== targetValue)
          .forEach((value) => params.append(key, value));
      };
    
      if (keyToRemove === "price") {
        params.delete("min");
        params.delete("minPrice");
        params.delete("max");
        params.delete("maxPrice");
      } else if (keyToRemove === "q") {
        params.delete("q");
        params.delete("search");
      } else if (keyToRemove === "condition") {
        deleteMultiValue("condition", valueToRemove);
        deleteMultiValue("cond", valueToRemove);
      } else if (keyToRemove === "loc") {
        params.delete("loc");
        params.delete("location");
      } else if (keyToRemove === "gender") {
        params.delete("gender");
      } else if (keyToRemove === "movement") {
        deleteMultiValue("movement", valueToRemove);
      } else if (keyToRemove === "box") {
        params.delete("box");
      } else if (keyToRemove === "verified") {
        params.delete("verified");
      } else if (keyToRemove === "brand") {
        deleteMultiValue("brand", valueToRemove);
      } else {
        params.delete(keyToRemove);
      }
    
      params.delete("page"); // Reset to page 1 when filter changes
      const queryString = params.toString();
      startNavigation({ immediate: true });
      router.replace(queryString ? `/listings?${queryString}` : "/listings", {
        scroll: false,
      });
    },
    [currentParamsString, router, startNavigation]
  );

  const clearAllFilters = useCallback(() => {
    startNavigation({ immediate: true });
    router.replace("/listings", { scroll: false });
  }, [router, startNavigation]);

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
                onClick={() => removeFilter(filter.key, filter.rawValue)}
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
            key={`${filter.key}-${filter.rawValue ?? filter.value}`}
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


