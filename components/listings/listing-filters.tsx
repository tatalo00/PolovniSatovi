"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface ListingFiltersProps {
  brands: string[];
  searchParams: Record<string, string | undefined>;
}

export function ListingFilters({ brands, searchParams }: ListingFiltersProps) {
  const router = useRouter();
  const currentParams = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.search || "",
    brand: searchParams.brand || "all",
    condition: searchParams.condition || "all",
    minPrice: searchParams.minPrice || "",
    maxPrice: searchParams.maxPrice || "",
    year: searchParams.year || "",
    location: searchParams.location || "",
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      }
    });

    router.push(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      brand: "all",
      condition: "all",
      minPrice: "",
      maxPrice: "",
      year: "",
      location: "",
    });
    router.push("/listings");
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && value !== "all" && value !== ""
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filteri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Pretraga</Label>
          <Input
            id="search"
            placeholder="Marka, model, referenca..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Marka</Label>
          <Select
            value={filters.brand}
            onValueChange={(value) => setFilters({ ...filters, brand: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sve marke" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve marke</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Stanje</Label>
          <Select
            value={filters.condition}
            onValueChange={(value) => setFilters({ ...filters, condition: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sve" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve</SelectItem>
              <SelectItem value="New">Novo</SelectItem>
              <SelectItem value="Like New">Kao novo</SelectItem>
              <SelectItem value="Excellent">Odlično</SelectItem>
              <SelectItem value="Very Good">Vrlo dobro</SelectItem>
              <SelectItem value="Good">Dobro</SelectItem>
              <SelectItem value="Fair">Zadovoljavajuće</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cena (EUR)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Godina</Label>
          <Input
            id="year"
            type="number"
            placeholder="npr. 2018"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lokacija</Label>
          <Input
            id="location"
            placeholder="npr. Beograd"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Primeni
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Obriši
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

