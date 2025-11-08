"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency/price-display";
import { ArrowRight } from "lucide-react";

interface FeaturedListingsProps {
  listings: any[];
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Istaknuti Oglasi
            </h2>
            <p className="text-muted-foreground mt-2">
              Najnovije ponude od naših prodavaca
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/listings">
              Vidi sve <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listings.slice(0, 8).map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`}>
              <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20">
                <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                  {listing.photos && listing.photos.length > 0 ? (
                    <Image
                      src={listing.photos[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="flex h-full items-center justify-center bg-muted"><span class="text-muted-foreground text-xs">Greška</span></div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">Nema slike</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-sm leading-tight transition-colors group-hover:text-primary">
                    {listing.title}
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {listing.brand} {listing.model}
                    {listing.reference && ` • ${listing.reference}`}
                  </p>
                  <div className="mb-3 text-lg font-bold">
                    <PriceDisplay amountEurCents={listing.priceEurCents} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {listing.condition && (
                      <Badge variant="secondary" className="text-xs">
                        {listing.condition}
                      </Badge>
                    )}
                    {listing.year && (
                      <span className="text-xs text-muted-foreground">{listing.year}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

