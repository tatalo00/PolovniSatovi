"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
              <Card className="h-full transition-shadow hover:shadow-lg">
                <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                  {listing.photos && listing.photos.length > 0 ? (
                    <Image
                      src={listing.photos[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">Nema slike</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-1 line-clamp-2 font-semibold text-sm">
                    {listing.title}
                  </h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {listing.brand} {listing.model}
                    {listing.reference && ` • ${listing.reference}`}
                  </p>
                  <div className="mb-2 text-lg font-bold">
                    <PriceDisplay amountEurCents={listing.priceEurCents} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {listing.condition && <span>{listing.condition}</span>}
                    {listing.year && <span>• {listing.year}</span>}
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

