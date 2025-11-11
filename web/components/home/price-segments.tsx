import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PriceSegmentCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  listingsCount: number;
  featuredBrands: string[];
  imageUrl: string | null;
  href: string;
}

interface PriceSegmentsProps {
  segments: PriceSegmentCard[];
}

export function PriceSegments({ segments }: PriceSegmentsProps) {
  if (!segments.length) {
    return null;
  }

  return (
    <section className="bg-muted/20 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-2xl space-y-3">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Kurirane kolekcije
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pronađite sat u svom budžetu
          </h2>
          <p className="text-muted-foreground">
            Četiri pažljivo odabrane kolekcije koje pokrivaju sve – od pristupačnih modela
            za prve kupce do investicionih komada za iskusne kolekcionare.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {segments.map((segment) => (
            <Card
              key={segment.id}
              className="group relative overflow-hidden border-border/60 bg-background/90 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
                {segment.imageUrl && (
                  <Image
                    src={segment.imageUrl}
                    alt={segment.title}
                    fill
                    className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-80"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                  />
                )}
              </div>

              <CardContent className="relative flex h-full flex-col justify-between gap-6 p-6">
                <div className="space-y-3 text-white drop-shadow-sm">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/80">
                      {segment.subtitle}
                    </p>
                    <h3 className="text-xl font-semibold">{segment.title}</h3>
                  </div>
                  <p className="max-w-[22ch] text-sm text-white/80">
                    {segment.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-white/90">
                    <span className="text-2xl font-semibold text-white">
                      {segment.listingsCount.toLocaleString("sr-RS")}
                    </span>{" "}
                    aktivnih oglasa
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {segment.featuredBrands.length ? (
                      segment.featuredBrands.map((brand) => (
                        <span
                          key={`${segment.id}-${brand}`}
                          className={cn(
                            "rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur",
                            "transition group-hover:border-white/60 group-hover:bg-white/20"
                          )}
                        >
                          {brand}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/70">
                        Istražite brendove u ovoj kategoriji
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full justify-between rounded-full bg-white/90 text-primary transition group-hover:bg-white"
                  >
                    <Link href={segment.href}>
                      Pogledaj kolekciju
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

