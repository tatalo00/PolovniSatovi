import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ListingSummary {
  id: string;
  title: string;
  brand: string;
  model: string;
  reference?: string | null;
  priceEurCents: number;
  condition?: string | null;
  year?: number | null;
  photos: Array<{ url: string }>;
}

interface RecentListingsProps {
  listings: ListingSummary[];
}

export function RecentListings({ listings }: RecentListingsProps) {
  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Nedavno dodato
            </h2>
            <p className="text-muted-foreground mt-2">
              Sveže ponude od proverenih prodavaca – informacije se ažuriraju u realnom vremenu.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/listings">
              Vidi sve oglase <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="snap-start"
              >
                <Card className="group w-[260px] sm:w-[280px] md:w-[320px] h-full transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="relative h-52 w-full overflow-hidden rounded-t-lg bg-muted">
                    {listing.photos?.[0]?.url ? (
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        sizes="(max-width: 768px) 60vw, 320px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Nema slike
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {listing.brand} {listing.model}
                        {listing.reference ? ` • ${listing.reference}` : ""}
                      </p>
                    </div>
                    <div className="text-lg font-semibold">
                      <PriceDisplay amountEurCents={listing.priceEurCents} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {listing.condition && <span>{listing.condition}</span>}
                      {listing.year && <span>{listing.year}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


