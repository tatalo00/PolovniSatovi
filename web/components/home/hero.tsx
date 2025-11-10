"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";

const CONDITION_OPTIONS = [
  { value: "all", label: "Sve" },
  { value: "New", label: "Novo" },
  { value: "Like New", label: "Kao novo" },
  { value: "Excellent", label: "Odlično" },
  { value: "Very Good", label: "Vrlo dobro" },
  { value: "Good", label: "Dobro" },
  { value: "Fair", label: "Zadovoljavajuće" },
];

const GENDER_OPTIONS = [
  { value: "all", label: "Svi" },
  { value: "male", label: "Muški i uniseks" },
  { value: "female", label: "Ženski i uniseks" },
  { value: "unisex", label: "Uniseks" },
] as const;

const INITIAL_FILTERS = {
  brand: "",
  model: "",
  min: "",
  max: "",
  year: "",
  cond: "all",
  loc: "",
  gender: "all",
};

type FiltersState = typeof INITIAL_FILTERS;

export function Hero() {
  const router = useRouter();
  const { start: startNavigation } = useNavigationFeedback();
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [showMore, setShowMore] = useState(false);

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filters).some(([key, value]) => {
        if (key === "cond" || key === "gender") {
          return value !== "all";
        }
        return value.trim().length > 0;
      }),
    [filters]
  );

  const applyFilters = useCallback(
    (nextFilters?: FiltersState) => {
      const activeFilters = nextFilters ?? filters;
      const params = new URLSearchParams();

      const mappings: Array<[keyof FiltersState, string]> = [
        ["brand", "brand"],
        ["model", "model"],
        ["min", "min"],
        ["max", "max"],
        ["year", "year"],
        ["cond", "cond"],
        ["loc", "loc"],
        ["gender", "gender"],
      ];

      mappings.forEach(([key, queryKey]) => {
        const value = activeFilters[key].trim();
        if ((key === "cond" || key === "gender") && value === "all") {
          return;
        }
        if (value) {
          params.set(queryKey, value);
        }
      });

      const queryString = params.toString();
      startNavigation({ immediate: true });
      router.push(queryString ? `/listings?${queryString}` : "/listings");
    },
    [filters, router, startNavigation]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    startNavigation({ immediate: true });
    router.push("/listings");
  };

  const toggleAdditionalFilters = () => {
    setShowMore((prev) => !prev);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <div className="md:flex md:items-start md:justify-between md:gap-12">
            <div className="md:flex-1">
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Pronađite svoj savršeni sat
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Najveća ponuda polovnih i vintage satova na Balkanu. Filtrirajte po marki, modelu i ceni da brže dođete do idealnog oglasa.
              </p>

              <div className="rounded-3xl border border-border/80 bg-background/80 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-left">
                      <Label htmlFor="hero-brand" className="mb-1 block text-sm font-medium">
                        Marka
                      </Label>
                      <Input
                        id="hero-brand"
                        placeholder="npr. Rolex"
                        value={filters.brand}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, brand: event.target.value }))
                        }
                      />
                    </div>
                    <div className="text-left">
                      <Label htmlFor="hero-model" className="mb-1 block text-sm font-medium">
                        Model
                      </Label>
                      <Input
                        id="hero-model"
                        placeholder="npr. Submariner"
                        value={filters.model}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, model: event.target.value }))
                        }
                      />
                    </div>
                    <div className="text-left">
                      <Label htmlFor="hero-min-price" className="mb-1 block text-sm font-medium">
                        Cena od (EUR)
                      </Label>
                      <Input
                        id="hero-min-price"
                        inputMode="numeric"
                        placeholder="Min"
                        value={filters.min}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, min: event.target.value }))
                        }
                      />
                    </div>
                    <div className="text-left">
                      <Label htmlFor="hero-max-price" className="mb-1 block text-sm font-medium">
                        Cena do (EUR)
                      </Label>
                      <Input
                        id="hero-max-price"
                        inputMode="numeric"
                        placeholder="Max"
                        value={filters.max}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, max: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant={showMore ? "secondary" : "outline"}
                        onClick={toggleAdditionalFilters}
                        className="inline-flex items-center gap-2"
                        aria-expanded={showMore}
                        aria-controls="hero-additional-filters"
                      >
                        <SlidersHorizontal className="h-4 w-4" aria-hidden />
                        Dodatni filteri
                        {showMore ? (
                          <ChevronUp className="h-4 w-4" aria-hidden />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden />
                        )}
                      </Button>
                      {hasActiveFilters && (
                        <Button type="button" variant="ghost" onClick={handleReset}>
                          Resetuj filtere
                        </Button>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-3">
                      <Button type="submit" size="lg" className="px-6">
                        Pretraži oglase
                      </Button>
                      <Button asChild variant="outline" size="lg" className="px-6">
                        <Link href="/sell">Prodaj svoj sat</Link>
                      </Button>
                    </div>
                  </div>

                  <div
                    id="hero-additional-filters"
                    className={cn(
                      "grid gap-4 overflow-hidden transition-[max-height,opacity] duration-300",
                      showMore ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
                    )}
                    aria-hidden={!showMore}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="text-left">
                        <Label htmlFor="hero-year" className="mb-1 block text-sm font-medium">
                          Godište
                        </Label>
                        <Input
                          id="hero-year"
                          inputMode="numeric"
                          placeholder="npr. 2018"
                          value={filters.year}
                          onChange={(event) =>
                            setFilters((prev) => ({ ...prev, year: event.target.value }))
                          }
                        />
                      </div>
                      <div className="text-left">
                        <Label htmlFor="hero-condition" className="mb-1 block text-sm font-medium">
                          Stanje
                        </Label>
                        <Select
                          value={filters.cond}
                          onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, cond: value }))
                          }
                        >
                          <SelectTrigger id="hero-condition">
                            <SelectValue placeholder="Odaberite stanje" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    <div className="text-left">
                      <Label htmlFor="hero-gender" className="mb-1 block text-sm font-medium">
                        Namenjeno
                      </Label>
                      <Select
                        value={filters.gender}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger id="hero-gender">
                          <SelectValue placeholder="Odaberite" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                      <div className="text-left">
                        <Label htmlFor="hero-location" className="mb-1 block text-sm font-medium">
                          Lokacija
                        </Label>
                        <Input
                          id="hero-location"
                          placeholder="npr. Beograd"
                          value={filters.loc}
                          onChange={(event) =>
                            setFilters((prev) => ({ ...prev, loc: event.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-6 text-center md:mt-0 md:w-72">
              <div className="rounded-3xl border border-border/80 bg-background/80 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <h2 className="text-2xl font-semibold">Istražite ponudu</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Pogledajte sve oglase ili podelite svoj sat sa zajednicom kolekcionara.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/listings">Pregledaj sve oglase</Link>
                  </Button>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/sell">Objavi oglas</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

