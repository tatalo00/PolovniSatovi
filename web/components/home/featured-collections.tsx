import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { BLUR_DATA_URL } from "@/lib/image-utils";

export type PaidListing = {
  id: string;
  title: string;
  brand: string;
  priceLabel: string;
  href: string;
  imageUrl?: string | null;
  locationLabel?: string | null;
  sellerLabel?: string | null;
  isVerifiedSeller?: boolean;
  sellerProfileSlug?: string | null;
};

interface PaidListingsProps {
  listings: PaidListing[];
}

export function PaidListings({ listings }: PaidListingsProps) {
  if (!listings.length) {
    return null;
  }

  return (
    <section className="bg-background py-12 sm:py-16 md:py-20">
      <div className="container mx-auto space-y-8 sm:space-y-10 md:space-y-12 px-3 sm:px-4 md:px-6">
        <div className="space-y-2 sm:space-y-3 text-center">
          <p className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            Promovisani Oglasi
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight sm:leading-normal">
            Plaćeni istaknuti oglasi na početnoj strani
          </h2>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
            Prodavci koji žele dodatnu vidljivost mogu promovisati svoje oglase i pojaviti se na
            vrhu početne stranice.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={listing.href}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80 shadow-lg outline-none transition duration-500 hover:-translate-y-1 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D4AF37]"
            >
              <article>
                <div className="relative aspect-[4/3] overflow-hidden">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted/60 via-muted to-muted/90 text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground"
                      aria-hidden
                    >
                      {listing.brand}
                      <span className="mt-1 text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-muted-foreground/70">
                        Sponsored
                      </span>
                    </div>
                  )}
                  <span className="absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full bg-primary px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-lg">
                    Sponsored
                  </span>
                  {listing.isVerifiedSeller && (
                    <span
                      title="Verifikovani prodavac"
                      className="absolute right-3 top-3 sm:right-4 sm:top-4 inline-flex rounded-full bg-white/95 backdrop-blur-sm p-1.5 shadow-sm border border-white/80"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" aria-hidden />
                    </span>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4 md:space-y-5 px-4 sm:px-5 md:px-6 pb-5 sm:pb-6 md:pb-8 pt-4 sm:pt-5 md:pt-6">
                  <div className="space-y-1.5 sm:space-y-2 text-left">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground">
                      {listing.brand}
                    </p>
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground leading-tight">
                      {listing.title}
                    </h3>
                    {listing.locationLabel ? (
                      <p className="text-xs sm:text-sm text-muted-foreground">{listing.locationLabel}</p>
                    ) : null}
                    {listing.sellerLabel ? (
                      <p className="text-xs sm:text-sm text-muted-foreground/80">
                        Prodavac: {listing.sellerLabel}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-muted-foreground">
                      {listing.priceLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary transition-colors group-hover:text-[#b6932c]">
                      Pogledaj oglas
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
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
