"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/listings/wishlist-button";
import { cn } from "@/lib/utils";

interface RecentListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  reference: string | null;
  priceEurCents: number;
  condition: string | null;
  locationLabel: string | null;
  createdAt: string;
  photos: Array<{ url: string }>;
}

interface RecentListingsProps {
  listings: RecentListing[];
  favoriteIds?: string[];
}

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const diff = Date.now() - date.getTime();

  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "pre nekoliko sekundi";
  if (minutes < 60) return `pre ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `pre ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `pre ${days} dana`;

  const weeks = Math.round(days / 7);
  if (weeks < 5) return `pre ${weeks} nedelje`;

  const months = Math.round(days / 30);
  if (months < 12) return `pre ${months} meseci`;

  const years = Math.round(days / 365);
  return `pre ${years} god.`;
}


export function RecentListings({ listings, favoriteIds = [] }: RecentListingsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const cardWidth = 320;
    const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, []);

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Nedavno dodati satovi
            </h2>
            <p className="text-muted-foreground">
              Najnoviji oglasi na platformi. Pratite stanje, lokaciju i cene čim se pojave.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="h-10 w-10 rounded-full"
                aria-label="Prethodni"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="h-10 w-10 rounded-full"
                aria-label="Sledeći"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/listings?sort=newest">
                Vidi sve oglase
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative -mx-4 px-4">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {listings.map((listing) => {
              const primaryPhoto = listing.photos?.[0]?.url ?? null;
              const isFavorite = favoriteIds.includes(listing.id);
              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group flex-shrink-0 snap-start"
                >
                  <Card className={cn(
                    "relative flex h-full w-[280px] sm:w-[300px] flex-col overflow-hidden",
                    "border-border/60 bg-background/80 shadow-sm",
                    "transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:shadow-lg"
                  )}>
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      {primaryPhoto ? (
                        <Image
                          src={primaryPhoto}
                          alt={`${listing.brand} ${listing.model}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="300px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Nema fotografije
                        </div>
                      )}
                      <div className="absolute right-3 top-3">
                        <WishlistButton
                          listingId={listing.id}
                          initialIsFavorite={isFavorite}
                          size="sm"
                          className={cn(
                            "border border-white/40 bg-white/90 backdrop-blur hover:bg-white",
                            "md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          )}
                        />
                      </div>
                      <div className="absolute left-3 bottom-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                          <Clock3 className="h-3 w-3" aria-hidden />
                          {formatRelativeTime(listing.createdAt)}
                        </span>
                      </div>
                    </div>
                    <CardContent className="flex flex-1 flex-col gap-3 p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#D4AF37]">
                          <span>{listing.brand}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">{listing.model}</span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-tight">
                          {listing.title}
                        </h3>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <PriceDisplay amountEurCents={listing.priceEurCents} className="text-base font-bold" />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" aria-hidden />
                          <span className="truncate max-w-[80px]">{listing.locationLabel ?? "Online"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            <Link href="/listings?sort=newest" className="flex-shrink-0 snap-start">
              <Card className={cn(
                "flex h-full w-[280px] sm:w-[300px] flex-col items-center justify-center",
                "border-dashed border-2 border-border/60 bg-muted/30",
                "transition-all duration-200 hover:border-[#D4AF37]/40 hover:bg-muted/50"
              )}>
                <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center h-full min-h-[320px]">
                  <div className="rounded-full bg-[#D4AF37]/10 p-4">
                    <ArrowRight className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Vidi sve oglase</p>
                    <p className="text-sm text-muted-foreground">Pregledaj kompletnu ponudu satova</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
