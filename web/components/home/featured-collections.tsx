import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export type PaidListing = {
  id: string;
  title: string;
  brand: string;
  priceLabel: string;
  href: string;
  imageUrl?: string | null;
  locationLabel?: string | null;
  sellerLabel?: string | null;
};

interface PaidListingsProps {
  listings: PaidListing[];
}

export function PaidListings({ listings }: PaidListingsProps) {
  if (!listings.length) {
    return null;
  }

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto space-y-12 px-4 md:px-6">
        <div className="space-y-3 text-center">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
            Promovisani Oglasi
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Plaćene istaknute objave na početnoj strani
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
            Prodavci koji žele dodatnu vidljivost mogu promovisati svoje oglase i pojaviti se na
            vrhu početne stranice. Ovo su trenutno aktivne plaćene pozicije.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={listing.href}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-lg outline-none transition duration-500 hover:-translate-y-1 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D4AF37]"
            >
              <article>
                <div className="relative aspect-[4/3] overflow-hidden">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted/60 via-muted to-muted/90 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground"
                      aria-hidden
                    >
                      {listing.brand}
                      <span className="mt-1 text-[10px] tracking-[0.5em] text-muted-foreground/70">
                        Sponsored
                      </span>
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-lg">
                    Sponsored
                  </span>
                </div>

                <div className="space-y-5 px-6 pb-8 pt-6">
                  <div className="space-y-2 text-left">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                      {listing.brand}
                    </p>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {listing.title}
                    </h3>
                    {listing.locationLabel ? (
                      <p className="text-sm text-muted-foreground">{listing.locationLabel}</p>
                    ) : null}
                    {listing.sellerLabel ? (
                      <p className="text-sm text-muted-foreground/80">
                        Prodavac: {listing.sellerLabel}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {listing.priceLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-[#b6932c]">
                      Pogledaj oglas
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
