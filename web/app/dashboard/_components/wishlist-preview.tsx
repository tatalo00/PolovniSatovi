import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency/price-display";

interface WishlistPreviewProps {
  userId: string;
}

export async function WishlistPreview({ userId }: WishlistPreviewProps) {
  const wishlistItems = await prisma.favorite.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          photos: {
            orderBy: { order: "asc" },
            take: 1,
          },
          seller: {
            select: {
              name: true,
              isVerified: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (wishlistItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            Nemate sačuvanih oglasa.{" "}
            <Link href="/listings" className="text-[#D4AF37] hover:underline font-semibold">
              Pretražite oglase
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wishlistItems.map((favorite) => {
        const listing = favorite.listing;
        if (!listing) return null;
        
        return (
          <Link key={favorite.id} href={`/listing/${listing.id}`}>
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
                <h3 className="mb-2 line-clamp-2 font-semibold text-sm leading-tight transition-colors group-hover:text-[#D4AF37]">
                  {listing.title}
                </h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  {listing.brand} {listing.model}
                  {listing.reference && ` • ${listing.reference}`}
                </p>
                <div className="mb-2 text-lg font-bold">
                  <PriceDisplay amountEurCents={listing.priceEurCents} />
                </div>
                {listing.seller?.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                    Verifikovan prodavac
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
