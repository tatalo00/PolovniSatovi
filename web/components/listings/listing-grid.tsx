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
import { ShieldCheck, UserCheck } from "lucide-react";

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
  const CONDITION_LABELS: Record<string, string> = {
    New: "Novo",
    "Like New": "Kao novo",
    Excellent: "Odlično",
    "Very Good": "Vrlo dobro",
    Good: "Dobro",
    Fair: "Za servis",
    Poor: "Za servis",
    Refurbished: "Renovirano",
  };

  const conditionLabel = listing.condition
    ? CONDITION_LABELS[listing.condition] ?? listing.condition
    : undefined;

  const isVerifiedSeller = listing.seller?.isVerified === true;
  const isAuthenticatedSeller = !isVerifiedSeller && listing.seller?.isAuthenticated === true;
  const badgeTitle = isVerifiedSeller
    ? "Verifikovani prodavac"
    : isAuthenticatedSeller
    ? "Autentifikovani korisnik"
    : null;

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/95 shadow transition-all duration-200 hover:border-[#D4AF37]/50 hover:shadow-lg">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {(isVerifiedSeller || isAuthenticatedSeller) && (
            <div
              title={badgeTitle ?? undefined}
              className="absolute left-2 top-2 z-10 rounded-full border border-white/70 bg-white/90 p-1 shadow-sm"
            >
              {isVerifiedSeller ? (
                <ShieldCheck className="h-4 w-4 text-[#D4AF37]" aria-hidden />
              ) : (
                <UserCheck className="h-4 w-4 text-neutral-900" aria-hidden />
              )}
            </div>
          )}
          <WishlistButton
            listingId={listing.id}
            isFavorite={isFavorite}
            initialIsFavorite={isFavorite}
            className="absolute right-2 top-2 z-10 rounded-full border border-white/70 bg-white/90 p-1 shadow-sm"
            onToggle={onToggle}
          />
          {listing.photos && listing.photos.length > 0 ? (
            <Image
              src={listing.photos[0].url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
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
        <CardContent className="flex flex-1 flex-col p-2.5">
          <h3 className="mb-1 line-clamp-2 min-h-[32px] text-sm font-semibold leading-snug transition-colors group-hover:text-[#D4AF37]">
            {listing.title}
          </h3>
          <p className="mb-1 line-clamp-2 min-h-[20px] text-[11px] text-muted-foreground">
            {listing.brand} {listing.model}
            {listing.reference && ` • ${listing.reference}`}
          </p>
          <div className="mb-2 text-[15px] font-semibold text-neutral-900">
            <PriceDisplay amountEurCents={listing.priceEurCents} />
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-1 pt-2 text-[10px] text-muted-foreground">
            {conditionLabel && (
              <Badge variant="secondary" className="text-[9px] uppercase tracking-[0.08em]">
                {conditionLabel}
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
        "grid gap-3 sm:grid-cols-2",
        gridColumnClass,
        columns === 5 ? "gap-2.5 xl:gap-3" : "gap-3 xl:gap-3.5"
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

