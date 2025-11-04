"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Watch } from "lucide-react";

interface CategoriesProps {
  brands: string[];
}

export function Categories({ brands }: CategoriesProps) {
  const popularBrands = brands.slice(0, 12);

  if (popularBrands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Popularne Marke
          </h2>
          <p className="text-muted-foreground mt-2">
            Pretražite oglase po marki
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {popularBrands.map((brand) => (
            <Link key={brand} href={`/listings?brand=${encodeURIComponent(brand)}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Watch className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{brand}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

