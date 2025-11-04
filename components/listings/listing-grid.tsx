"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";

interface ListingGridProps {
  listings: any[];
}

export function ListingGrid({ listings }: ListingGridProps) {

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nema oglasa koji odgovaraju vašim filterima.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
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
                  <span className="text-muted-foreground">Nema slike</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="mb-1 line-clamp-2 font-semibold">{listing.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                {listing.brand} {listing.model}
                {listing.reference && ` • ${listing.reference}`}
              </p>
              <div className="mb-2 text-2xl font-bold">
                <PriceDisplay amountEurCents={listing.priceEurCents} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {listing.condition && <span>Stanje: {listing.condition}</span>}
                {listing.year && <span>• {listing.year}</span>}
                {listing.seller?.locationCity && (
                  <span>• {listing.seller.locationCity}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

