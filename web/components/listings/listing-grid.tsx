"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";
import type { ListingSummary } from "@/types/listing";

interface ListingGridProps {
  listings: ListingSummary[];
  columns: number;
  scrollKey?: string;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (listingId: string, nextValue: boolean) => void;
}

interface ListingGridCardProps {
  listing: ListingSummary;
  isFavorite: boolean;
  onToggle?: (nextValue: boolean) => void;
}

const ListingGridCard = memo(function ListingGridCard({
  listing,
  isFavorite,
  onToggle,
}: ListingGridCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-lg">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <WishlistButton
            listingId={listing.id}
            isFavorite={isFavorite}
            initialIsFavorite={isFavorite}
            className="absolute right-2 top-2 z-10 rounded-full bg-background/90 shadow-sm"
            onToggle={onToggle}
          />
          {listing.photos && listing.photos.length > 0 ? (
            <Image
              src={listing.photos[0].url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<div class="flex h-full items-center justify-center bg-muted"><span class="text-muted-foreground text-sm">Greška pri učitavanju</span></div>';
                }
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
              <span className="text-muted-foreground">Nema slike</span>
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col p-3.5">
          <h3 className="mb-1 line-clamp-2 min-h-[40px] font-semibold leading-tight transition-colors group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="mb-2 line-clamp-2 min-h-[28px] text-sm text-muted-foreground">
            {listing.brand} {listing.model}
            {listing.reference && ` • ${listing.reference}`}
          </p>
          <div className="mb-2 text-lg font-semibold">
            <PriceDisplay amountEurCents={listing.priceEurCents} />
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-xs text-muted-foreground">
            {listing.condition && (
              <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                {listing.condition}
              </Badge>
            )}
            {listing.year && <span>{listing.year}</span>}
            {(listing.seller?.locationCity || listing.location) && (
              <span className="truncate">
                {listing.seller?.locationCity || listing.location}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

function ListingGridBase({
  listings,
  columns,
  scrollKey,
  favoriteIds,
  onToggleFavorite,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        iconType="listings"
        title="Nema oglasa"
        description="Nema oglasa koji odgovaraju vašim filterima. Pokušajte da ih prilagodite ili obrišete."
        action={{
          label: "Obriši sve filtere",
          href: "/listings",
        }}
      />
    );
  }

  const gridColumnClass =
    columns === 5 ? "lg:grid-cols-5" : columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        gridColumnClass,
        columns === 5 ? "gap-3 xl:gap-4" : "gap-4"
      )}
      data-scroll-key={scrollKey}
    >
      {listings.map((listing) => (
        <ListingGridCard
          key={listing.id}
          listing={listing}
          isFavorite={favoriteIds?.has(listing.id) ?? false}
          onToggle={(next) => onToggleFavorite?.(listing.id, next)}
        />
      ))}
    </div>
  );
}

export const ListingGrid = memo(ListingGridBase);

