import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency/price-display";

interface ListingsPreviewProps {
  userId: string;
}

export async function ListingsPreview({ userId }: ListingsPreviewProps) {
  const newestListings = await prisma.listing.findMany({
    where: { sellerId: userId },
    include: {
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (newestListings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            Nemate još nijedan oglas.{" "}
            <Link href="/dashboard/listings/new" className="text-[#D4AF37] hover:underline font-semibold">
              Kreirajte prvi oglas
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {newestListings.map((listing) => (
        <Link key={listing.id} href={`/dashboard/listings/${listing.id}`}>
          <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:border-[#D4AF37]/40 cursor-pointer">
            <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
              {listing.photos && listing.photos.length > 0 ? (
                <Image
                  src={listing.photos[0].url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-sm">Nema slike</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="line-clamp-2 font-semibold text-sm leading-tight transition-colors group-hover:text-[#D4AF37] flex-1">
                  {listing.title}
                </h3>
                <Badge
                  variant={listing.status === "APPROVED" ? "default" : "secondary"}
                  className="text-xs shrink-0"
                >
                  {listing.status}
                </Badge>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                {listing.brand} {listing.model}
                {listing.reference && ` • ${listing.reference}`}
              </p>
              <div className="text-lg font-bold">
                <PriceDisplay amountEurCents={listing.priceEurCents} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
