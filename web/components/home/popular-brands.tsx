"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { POPULAR_BRANDS } from "@/lib/brands";

interface PopularBrandCard {
  name: string;
  description?: string;
  listingsCount: number;
  startingPriceEurCents: number | null;
  topModels: string[];
  verified?: boolean;
}

interface PopularBrandsProps {
  brands: PopularBrandCard[];
}

function formatPrice(eurCents: number | null | undefined) {
  if (eurCents == null) return null;
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eurCents / 100);
}

export function PopularBrands({ brands }: PopularBrandsProps) {
  const fallback = POPULAR_BRANDS.slice(0, 12).map((brand) => ({
    name: brand.name,
    description: brand.description,
    listingsCount: 0,
    startingPriceEurCents: null,
    topModels: [],
    verified: "verified" in brand ? Boolean((brand as { verified?: boolean }).verified) : false,
  }));

  const cards = brands.length ? brands : fallback;

  return (
    <section className="bg-muted/30 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Najtraženiji brendovi
            </h2>
            <p className="text-muted-foreground">
              12 najpopularnijih marki po broju aktivnih oglasa. Pogledajte startne cene,
              najbolje modele i dostupne verifikovane listinge.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:translate-x-1"
          >
            Pogledaj sve oglase
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.slice(0, 12).map((brand) => {
            const initials = brand.name
              .split(" ")
              .slice(0, 2)
              .map((part) => part.charAt(0))
              .join("")
              .toUpperCase();
            const priceLabel = formatPrice(brand.startingPriceEurCents);
            return (
              <Link
                key={brand.name}
                href={`/listings?brand=${encodeURIComponent(brand.name)}`}
                className="group"
              >
                <Card className="h-full overflow-hidden border-border/70 bg-background/80 shadow-sm transition hover:translate-y-[-4px] hover:border-primary/40 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                          {initials}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                            {brand.name}
                          </h3>
                          {brand.description && (
                            <p className="text-xs text-muted-foreground">{brand.description}</p>
                          )}
                        </div>
                      </div>
                      {brand.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200">
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{brand.listingsCount} aktivnih oglasa</span>
                      {priceLabel ? <span>od {priceLabel}</span> : <span>Kontaktirajte</span>}
                    </div>

                    {brand.topModels?.length ? (
                      <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground transition group-hover:bg-primary/5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                          Top modeli
                        </p>
                        <ul className="space-y-1.5">
                          {brand.topModels.slice(0, 3).map((model) => (
                            <li key={model} className="flex items-center justify-between gap-2">
                              <span className="truncate">{model}</span>
                              <span className="text-[10px] uppercase tracking-wide text-primary">
                                Pogledaj
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
                        Trenutno dostupni modeli variraju — pogledajte ceo izbor.
                      </div>
                    )}

                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
                      Istraži ponudu
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
