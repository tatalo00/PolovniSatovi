"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";
import type { ListingSummary } from "@/types/listing";
import { ShieldCheck, UserCheck, MapPin, Calendar } from "lucide-react";

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
  const [isPressed, setIsPressed] = useState(false);

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

  const location = listing.seller?.locationCity || listing.location;

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsPressed(false), 200);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
    // Don't prevent default to allow navigation
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <Link 
      href={`/listing/${listing.id}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="block touch-manipulation"
      style={{ touchAction: 'manipulation' }}
    >
      <Card className={cn(
        "group relative flex w-full flex-row lg:flex-col items-center lg:items-stretch overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/95 shadow-md transition-all duration-200 hover:border-[#D4AF37]/60 hover:shadow-xl",
        "h-[180px] sm:h-[200px] md:h-[220px] lg:h-full",
        isPressed && "lg:scale-100 scale-[0.97] lg:shadow-md shadow-sm border-[#D4AF37]/40 lg:border-neutral-200/70"
      )}>
        {/* Wishlist button - upper right corner of card */}
        <div className="absolute right-2 top-2 z-20">
          <WishlistButton
            listingId={listing.id}
            isFavorite={isFavorite}
            initialIsFavorite={isFavorite}
            size="sm"
            className="rounded-full border border-white/80 bg-white/95 backdrop-blur-sm shadow-md hover:bg-white [&_svg]:h-3 [&_svg]:w-3"
            onToggle={onToggle}
          />
        </div>

        {/* Image on left (mobile) / top (desktop) - responsive aspect ratio */}
        <div className="relative w-[140px] min-[475px]:w-[160px] sm:w-[180px] md:w-[200px] lg:w-full flex-shrink-0 ml-2 sm:ml-3 md:ml-4 lg:ml-0 mt-2 sm:mt-3 md:mt-4 lg:mt-0 mb-2 sm:mb-3 md:mb-4 lg:mb-0 aspect-square sm:aspect-[4/5] md:aspect-square lg:aspect-square">
          <div className="relative w-full h-full overflow-hidden bg-neutral-100 rounded-2xl lg:rounded-t-2xl lg:rounded-b-none">
            {(isVerifiedSeller || isAuthenticatedSeller) && (
              <div
                title={badgeTitle ?? undefined}
                className="absolute left-2 top-2 z-10 rounded-full border border-white/80 bg-white/95 backdrop-blur-sm p-1.5 shadow-md"
              >
                {isVerifiedSeller ? (
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" aria-hidden />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-900" aria-hidden />
                )}
              </div>
            )}
            {listing.photos && listing.photos.length > 0 ? (
              <Image
                src={listing.photos[0].url}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.05] rounded-2xl lg:rounded-t-2xl lg:rounded-b-none"
                loading="lazy"
                sizes="(max-width: 475px) 140px, (max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, (min-width: 1024px) 100%"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="flex h-full items-center justify-center bg-muted rounded-2xl lg:rounded-t-2xl lg:rounded-b-none"><span class="text-muted-foreground text-xs">Greška pri učitavanju</span></div>';
                  }
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl lg:rounded-t-2xl lg:rounded-b-none">
                <span className="text-muted-foreground text-xs font-medium">Nema slike</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content on right (mobile) / bottom (desktop) */}
        <CardContent className="flex flex-1 flex-col py-2 sm:py-3 md:py-4 lg:py-4 px-3 sm:px-4 md:px-5 lg:px-6 min-w-0 justify-between lg:justify-between h-full lg:h-full">
          {/* Top section - Title and Reference */}
          <div className="space-y-1.5 sm:space-y-2 lg:space-y-2 min-w-0 pr-8 sm:pr-10 lg:pr-0">
            <h3 className="line-clamp-2 text-base sm:text-lg md:text-xl lg:text-xl font-bold leading-tight text-neutral-900 transition-colors group-hover:text-[#D4AF37]">
              {listing.title}
            </h3>
            
            {listing.reference && (
              <p className="text-[10px] sm:text-xs md:text-sm lg:text-xs font-mono text-muted-foreground">
                Ref: <span className="font-semibold">{listing.reference}</span>
              </p>
            )}
          </div>
          
          {/* Bottom section - Info, Price */}
          <div className="mt-auto space-y-2">
            {/* Small info row - Condition, Year, Location */}
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[9px] sm:text-[10px] md:text-xs lg:text-xs text-neutral-500">
              {conditionLabel && (
                <span className="font-medium">{conditionLabel}</span>
              )}
              {listing.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3 lg:w-3 flex-shrink-0" />
                  <span>{listing.year}</span>
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-[180px] lg:max-w-none">
                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3 lg:w-3 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </div>
            
            {/* Price */}
            <div className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-neutral-900 leading-none">
              <PriceDisplay amountEurCents={listing.priceEurCents} />
            </div>
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
        "flex flex-col gap-3 sm:gap-4 md:gap-5 lg:grid lg:items-stretch",
        gridColumnClass,
        "lg:gap-6"
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

