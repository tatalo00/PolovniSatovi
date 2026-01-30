import { prisma } from "@/lib/prisma";
import { AUTHENTICATION_STATUS } from "@/lib/authentication/status";
import { ListingGrid } from "@/components/listings/listing-grid";
import type { ListingSummary } from "@/types/listing";

interface SimilarListingsSectionProps {
  listingId: string;
  brand: string;
  priceEurCents: number;
  limit?: number;
}

export async function SimilarListingsSection({
  listingId,
  brand,
  priceEurCents,
  limit = 4,
}: SimilarListingsSectionProps) {
  const similarRaw = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      id: { not: listingId },
      OR: [
        { brand: { equals: brand, mode: "insensitive" } },
        {
          priceEurCents: {
            gte: Math.round(priceEurCents * 0.7),
            lte: Math.round(priceEurCents * 1.3),
          },
        },
      ],
    },
    include: {
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
      seller: {
        select: {
          name: true,
          email: true,
          locationCity: true,
          locationCountry: true,
          isVerified: true,
          authentication: { select: { status: true } },
          sellerProfile: {
            select: {
              slug: true,
              storeName: true,
              shortDescription: true,
              logoUrl: true,
              ratingAvg: true,
              reviewCount: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (similarRaw.length === 0) return null;

  const similarListings: ListingSummary[] = similarRaw.map((listing) => {
    const currency: "EUR" | "RSD" =
      listing.currency === "EUR" || listing.currency === "RSD"
        ? listing.currency
        : "EUR";

    return {
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      reference: listing.reference,
      year: listing.year,
      condition: listing.condition,
      priceEurCents: listing.priceEurCents,
      currency,
      location: listing.location,
      photos: listing.photos.map((p) => ({ url: p.url })),
      seller: listing.seller
        ? {
            name: listing.seller.name,
            email: listing.seller.email,
            locationCity: listing.seller.locationCity,
            locationCountry: listing.seller.locationCountry,
            isVerified: listing.seller.isVerified,
            isAuthenticated:
              listing.seller.authentication?.status ===
              AUTHENTICATION_STATUS.APPROVED,
            profileSlug: listing.seller.sellerProfile?.slug ?? null,
            storeName: listing.seller.sellerProfile?.storeName ?? null,
            shortDescription:
              listing.seller.sellerProfile?.shortDescription ?? null,
            logoUrl: listing.seller.sellerProfile?.logoUrl ?? null,
            ratingAvg: listing.seller.sellerProfile?.ratingAvg
              ? Number(listing.seller.sellerProfile.ratingAvg)
              : null,
            reviewCount: listing.seller.sellerProfile?.reviewCount ?? null,
          }
        : null,
    };
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Slični satovi</h2>
      <ListingGrid listings={similarListings} columns={4} />
    </section>
  );
}
