import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Clock3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";

interface RegionalListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  priceEurCents: number;
  condition: string | null;
  locationLabel: string | null;
  createdAt: string;
  photoUrl: string | null;
}

interface RegionalHighlightsProps {
  listings: RegionalListing[];
  regionLabel: string | null;
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

export function RegionalHighlights({ listings, regionLabel }: RegionalHighlightsProps) {
  if (!listings.length) {
    return null;
  }

  const locationQuery =
    regionLabel && regionLabel !== "Vaš region" ? regionLabel : "";

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Popularno u {regionLabel ?? "vašoj regiji"}
            </h2>
            <p className="text-muted-foreground">
              Satovi dostupni za ličnu inspekciju i preuzimanje. Idealno za izbegavanje troškova
              slanja i brzo sklapanje dogovora.
            </p>
          </div>
          <Button asChild variant="link" className="text-primary">
            <Link
              href={
                locationQuery
                  ? `/listings?loc=${encodeURIComponent(locationQuery)}`
                  : "/listings?loc="
              }
            >
              Pronađi oglase blizu mene
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`}>
              <Card className="h-full overflow-hidden border-border/60 bg-background/90 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="relative h-44 w-full bg-muted">
                  {listing.photoUrl ? (
                    <Image
                      src={listing.photoUrl}
                      alt={`${listing.brand} ${listing.model}`}
                      fill
                      className="object-cover transition duration-300 hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Nema fotografije
                    </div>
                  )}
                </div>
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary/80">
                      {listing.brand}
                    </p>
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                      {listing.title}
                    </h3>
                  </div>
                  <PriceDisplay amountEurCents={listing.priceEurCents} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {listing.locationLabel ?? "Dogovor"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {formatRelativeTime(listing.createdAt)}
                    </span>
                  </div>
                  {listing.condition && (
                    <span className="mt-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {listing.condition}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

