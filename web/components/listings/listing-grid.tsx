"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";
import type { ListingSummary } from "@/types/listing";
import { ShieldCheck, UserCheck, MapPin, Calendar, ArrowUpRight } from "lucide-react";

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
  imageSizes?: string;
}

const ListingGridCard = memo(function ListingGridCard({
  listing,
  isFavorite,
  onToggle,
  imageSizes = "(max-width: 475px) 140px, (max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, (min-width: 1024px) 25vw",
}: ListingGridCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const router = useRouter();
  const { start } = useNavigationFeedback();

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

  // Ensure isVerified is treated as boolean (handle null/undefined)
  const isVerifiedSeller = Boolean(listing.seller?.isVerified);
  const isAuthenticatedSeller = !isVerifiedSeller && Boolean(listing.seller?.isAuthenticated);
  const badgeTitle = isVerifiedSeller
    ? "Verifikovani prodavac"
    : isAuthenticatedSeller
      ? "Autentifikovani korisnik"
      : null;

  const location = listing.seller?.locationCity || listing.location;
  const sellerProfileSlug = listing.seller?.profileSlug;
  const sellerDisplayName =
    listing.seller?.storeName?.trim() ||
    listing.seller?.name?.trim() ||
    listing.seller?.email?.split("@")[0] ||
    "Prodavac";

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsPressed(false), 200);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleTouchStart = () => {
    setIsPressed(true);
    // Don't prevent default to allow navigation
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Start navigation feedback immediately
    start({ immediate: true });
    // Navigate immediately - browser will show new page, then load content
    router.push(`/listing/${listing.id}`);
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="block touch-manipulation cursor-pointer"
      style={{ touchAction: 'manipulation' }}
    >
      <Card className={cn(
        "group relative flex w-full flex-row lg:flex-col items-stretch overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/95 shadow-md transition-all duration-200 hover:border-[#D4AF37]/60 hover:shadow-xl",
        "h-[180px] sm:h-[200px] md:h-[220px] lg:h-full",
        isPressed && "lg:scale-100 scale-[0.97] lg:shadow-md shadow-sm border-[#D4AF37]/40 lg:border-neutral-200/70"
      )}>
        {/* Image on left (mobile) / top (desktop) - goes to upper border */}
        <div className="relative w-[140px] min-[475px]:w-[160px] sm:w-[180px] md:w-[200px] lg:w-full flex-shrink-0 lg:flex-shrink aspect-square sm:aspect-[4/5] md:aspect-square lg:aspect-square">
          <div className="relative w-full h-full overflow-hidden bg-neutral-100 lg:rounded-t-2xl">
            {/* Badge and Wishlist button - both in upper corners at same height */}
            <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
              {/* Badge - upper left */}
              <div className="pointer-events-auto">
                {(isVerifiedSeller || isAuthenticatedSeller) && (
                  sellerProfileSlug && isVerifiedSeller ? (
                    <Link
                      href={`/sellers/${sellerProfileSlug}`}
                      title={badgeTitle ?? undefined}
                      className="inline-flex rounded-full border border-white/80 bg-white/95 backdrop-blur-sm p-1.5 shadow-md hover:bg-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" aria-hidden />
                    </Link>
                  ) : (
                    <div
                      title={badgeTitle ?? undefined}
                      className="inline-flex rounded-full border border-white/80 bg-white/95 backdrop-blur-sm p-1.5 shadow-md"
                    >
                      {isVerifiedSeller ? (
                        <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" aria-hidden />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-900" aria-hidden />
                      )}
                    </div>
                  )
                )}
              </div>
              
              {/* Wishlist button - upper right */}
              <div className="pointer-events-auto">
                <WishlistButton
                  listingId={listing.id}
                  isFavorite={isFavorite}
                  initialIsFavorite={isFavorite}
                  size="sm"
                  className="rounded-full border border-white/80 bg-white/95 backdrop-blur-sm shadow-md hover:bg-white [&_svg]:h-3 [&_svg]:w-3"
                  onToggle={onToggle}
                />
              </div>
            </div>

            {listing.photos && listing.photos.length > 0 ? (
              <Image
                src={listing.photos[0].url}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                loading="lazy"
                sizes={imageSizes}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="flex h-full items-center justify-center bg-muted"><span class="text-muted-foreground text-xs">Greška pri učitavanju</span></div>';
                  }
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                <span className="text-muted-foreground text-xs font-medium">Nema slike</span>
              </div>
            )}
          </div>
        </div>

        {/* Content on right (mobile) / bottom (desktop) */}
        <CardContent className="flex flex-1 flex-col py-3 sm:py-4 md:py-4 lg:py-4 px-3 sm:px-4 md:px-5 lg:px-6 min-w-0 justify-between h-full">
          {/* Top section - Title and Reference */}
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <h3 className="line-clamp-2 text-base sm:text-lg md:text-lg lg:text-lg font-bold leading-tight text-neutral-900 transition-colors group-hover:text-[#D4AF37]">
              {listing.title}
            </h3>

            {listing.reference && (
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                Ref: <span className="font-semibold">{listing.reference}</span>
              </p>
            )}
          </div>

          {/* Bottom section - Info, Price */}
          <div className="mt-auto space-y-2.5">
            {/* Details row - Condition, Year, Location - fixed height for consistency */}
            <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1.5 min-h-[20px] text-[10px] sm:text-[11px] md:text-xs text-neutral-500">
              {conditionLabel && (
                <span className="font-medium whitespace-nowrap">{conditionLabel}</span>
              )}
              {listing.year && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>{listing.year}</span>
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 min-w-0 flex-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </div>

            {/* Price - smaller */}
            <div className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 leading-none">
              <PriceDisplay amountEurCents={listing.priceEurCents} currency={listing.currency || "EUR"} />
            </div>
            
            {isVerifiedSeller && sellerProfileSlug && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  start({ immediate: true });
                  router.push(`/sellers/${sellerProfileSlug}`);
                }}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border-2 border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-neutral-900 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/20 transition-all group/seller"
                title="Kliknite za pregled profila prodavca"
              >
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#D4AF37] flex-shrink-0" aria-hidden />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">{sellerDisplayName}</span>
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-60 group-hover/seller:opacity-100 group-hover/seller:translate-x-0.5 group-hover/seller:-translate-y-0.5 transition-all flex-shrink-0" aria-hidden />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
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
          imageSizes={`(max-width: 475px) 140px, (max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, (min-width: 1024px) ${columns === 5 ? "20vw" : columns === 4 ? "25vw" : "33vw"
            }`}
        />
      ))}
    </div>
  );
}

export const ListingGrid = memo(ListingGridBase);

