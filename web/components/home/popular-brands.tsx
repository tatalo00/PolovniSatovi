"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { POPULAR_BRANDS } from "@/lib/brands";

interface PopularBrandsProps {
  highlight?: string[];
}

export function PopularBrands({ highlight }: PopularBrandsProps) {
  const curated = highlight?.length
    ? POPULAR_BRANDS.filter(({ name }) => highlight.includes(name)).concat(
        POPULAR_BRANDS.filter(({ name }) => !highlight.includes(name))
      )
    : POPULAR_BRANDS;

  const brands = curated.slice(0, 3);

  return (
    <section className="bg-muted/40 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Popularne marke
          </h2>
          <p className="text-muted-foreground mt-2">
            Brzi pristup najtraženijim luksuznim i sportskim satovima na tržištu.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/listings?brand=${encodeURIComponent(brand.name)}`}
            >
              <Card className={cn(
                "group h-full cursor-pointer border border-border/60 bg-background transition-all hover:border-primary/40 hover:shadow-lg"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                      {brand.name}
                    </h3>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Istraži
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {brand.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


