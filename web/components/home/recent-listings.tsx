"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Eye, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/listings/wishlist-button";

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

const MOBILE_BREAKPOINT = 768;
const INITIAL_VISIBLE = 8;
const PAGE_SIZE = 4;

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
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(
    Math.min(INITIAL_VISIBLE, listings.length)
  );
  const [isMobile, setIsMobile] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((prev) =>
              Math.min(prev + PAGE_SIZE, listings.length)
            );
          }
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMobile, listings.length]);

  const displayed = useMemo(
    () => listings.slice(0, visibleCount),
    [listings, visibleCount]
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, listings.length));
  }, [listings.length]);

  const handleQuickView = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
      event.preventDefault();
      event.stopPropagation();
      router.push(`/listing/${id}`);
    },
    [router]
  );

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
              Real-time feed najnovijih oglasa. Pratite stanje, lokaciju i cene čim se pojave.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/listings">
              Vidi sve oglase
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {displayed.map((listing) => {
            const primaryPhoto = listing.photos?.[0]?.url ?? null;
            const isFavorite = favoriteIds.includes(listing.id);
            return (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group"
              >
                <Card className="relative flex h-full flex-col overflow-hidden border-border/60 bg-background/80 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    {primaryPhoto ? (
                      <Image
                        src={primaryPhoto}
                        alt={`${listing.brand} ${listing.model}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Nema fotografije
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <WishlistButton
                        listingId={listing.id}
                        initialIsFavorite={isFavorite}
                        size="sm"
                        className="border border-white/40 bg-white/80 backdrop-blur hover:bg-white"
                      />
                      <button
                        type="button"
                        onClick={(event) => handleQuickView(event, listing.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/80 text-foreground transition hover:bg-white"
                        aria-label="Brzi prikaz"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col gap-4 p-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/80">
                        <span>{listing.brand}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">{listing.model}</span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                        {listing.title}
                      </h3>
                      {listing.reference && (
                        <p className="text-xs text-muted-foreground">Ref. {listing.reference}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <PriceDisplay amountEurCents={listing.priceEurCents} />
                      {listing.condition && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {listing.condition}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {listing.locationLabel ?? "Online"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden />
                        {formatRelativeTime(listing.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {visibleCount < listings.length && !isMobile && (
          <div className="mt-8 flex justify-center">
            <Button onClick={handleLoadMore} variant="outline" size="lg">
              Učitaj još satova
            </Button>
          </div>
        )}
        <div ref={sentinelRef} />
      </div>
    </section>
  );
}
