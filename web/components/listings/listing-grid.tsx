"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL } from "@/lib/image-utils";
import { WishlistButton } from "./wishlist-button";
import { useNavigationFeedback } from "@/components/providers/navigation-feedback-provider";
import type { ListingSummary } from "@/types/listing";
import { ShieldCheck, MapPin } from "lucide-react";

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

  const isVerifiedSeller = Boolean(listing.seller?.isVerified);
  const location = listing.seller?.locationCity || listing.location;
  const sellerProfileSlug = listing.seller?.profileSlug;

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
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    start({ immediate: true });
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
      style={{ touchAction: "manipulation" }}
    >
      <Card
        className={cn(
          "group relative flex w-full flex-row lg:flex-col items-stretch overflow-hidden",
          "rounded-xl border border-neutral-200/80 bg-white",
          "shadow-sm transition-all duration-300 ease-out",
          "hover:border-[#D4AF37]/50 hover:shadow-lg",
          "h-[160px] sm:h-[180px] md:h-[200px] lg:h-full",
          // Override Card's default padding and gap
          "p-0 gap-0",
          isPressed &&
            "scale-[0.98] lg:scale-100 shadow-none lg:shadow-sm border-[#D4AF37]/40"
        )}
      >
        {/* Image section - rounded corners matching card */}
        <div
          className={cn(
            "relative overflow-hidden bg-neutral-100",
            "w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0",
            "lg:w-full lg:aspect-square",
            // Mobile: round left corners (horizontal layout)
            "rounded-l-xl lg:rounded-l-none",
            // Desktop: round top corners (vertical layout)
            "lg:rounded-t-xl"
          )}
        >
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 right-2 z-20 flex items-start justify-between pointer-events-none">
            {/* Verified badge - top left */}
            <div className="pointer-events-auto">
              {isVerifiedSeller && sellerProfileSlug ? (
                <Link
                  href={`/sellers/${sellerProfileSlug}`}
                  title="Verifikovani prodavac"
                  className="inline-flex rounded-full bg-white/95 backdrop-blur-sm p-1.5 shadow-sm border border-white/80 hover:bg-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShieldCheck
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]"
                    aria-hidden
                  />
                </Link>
              ) : isVerifiedSeller ? (
                <div
                  title="Verifikovani prodavac"
                  className="inline-flex rounded-full bg-white/95 backdrop-blur-sm p-1.5 shadow-sm border border-white/80"
                >
                  <ShieldCheck
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]"
                    aria-hidden
                  />
                </div>
              ) : null}
            </div>

            {/* Wishlist - top right */}
            <div className="pointer-events-auto">
              <WishlistButton
                listingId={listing.id}
                isFavorite={isFavorite}
                initialIsFavorite={isFavorite}
                size="sm"
                className={cn(
                  "rounded-full border border-white/80 bg-white/95 backdrop-blur-sm shadow-sm hover:bg-white",
                  "[&_svg]:h-3 [&_svg]:w-3",
                  "lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200"
                )}
                onToggle={onToggle}
              />
            </div>
          </div>

          {listing.photos && listing.photos.length > 0 ? (
            <Image
              src={listing.photos[0].url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              sizes={imageSizes}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
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
              <span className="text-muted-foreground text-xs font-medium">
                Nema slike
              </span>
            </div>
          )}
        </div>

        {/* Content section - new luxury hierarchy */}
        <CardContent
          className={cn(
            "flex flex-col flex-1 min-w-0",
            "p-3 sm:p-4 lg:p-5",
            "gap-1 sm:gap-1.5"
          )}
        >
          {/* Section 1: Brand + Model */}
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#D4AF37] font-semibold truncate">
              {listing.brand}
            </p>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 leading-tight line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
              {listing.model}
            </h3>
          </div>

          {/* Section 2: Reference (always reserve space) */}
          <p className="h-4 text-[10px] sm:text-xs font-mono text-muted-foreground truncate">
            {listing.reference ? `Ref: ${listing.reference}` : "\u00A0"}
          </p>

          {/* Section 3: Condition + Year chips */}
          <div className="flex items-center gap-1.5 min-h-[1.25rem]">
            {conditionLabel && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-neutral-600 flex-shrink-0">
                {conditionLabel}
              </span>
            )}
            {listing.year && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-neutral-600 flex-shrink-0">
                {listing.year}
              </span>
            )}
          </div>

          {/* Section 4: Price + Location (pushed to bottom) */}
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <PriceDisplay
              amountEurCents={listing.priceEurCents}
              currency={listing.currency || "EUR"}
              className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900"
            />
            {location && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[60px] sm:max-w-[80px]">
                  {location}
                </span>
              </span>
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
    columns === 5
      ? "lg:grid-cols-5"
      : columns === 4
        ? "lg:grid-cols-4"
        : "lg:grid-cols-3";

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
          imageSizes={`(max-width: 475px) 140px, (max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, (min-width: 1024px) ${columns === 5 ? "20vw" : columns === 4 ? "25vw" : "33vw"}`}
        />
      ))}
    </div>
  );
}

export const ListingGrid = memo(ListingGridBase);
