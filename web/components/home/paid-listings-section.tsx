import type { Listing, ListingPhoto } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { PaidListings, type PaidListing } from "./featured-collections";

type ListingWithPhotos = Listing & {
  photos: ListingPhoto[];
  seller: {
    isVerified: boolean;
    sellerProfile: {
      slug: string | null;
    } | null;
  } | null;
};

const EURO_FORMATTER = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formatEuroFromCents = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return null;
  }
  return EURO_FORMATTER.format(value / 100);
};

async function getPaidListings() {
  "use cache";
  cacheLife("hours");
  cacheTag("listings");

  return prisma.listing.findMany({
    where: { status: "APPROVED" },
    include: {
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
      seller: {
        select: {
          isVerified: true,
          sellerProfile: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
    orderBy: [
      { priceEurCents: "desc" },
      { createdAt: "desc" },
    ],
    take: 6,
  });
}

export async function PaidListingsSection() {
  let listingsRaw: ListingWithPhotos[] = [];

  try {
    listingsRaw = await getPaidListings();
  } catch (error) {
    console.error("Database error fetching paid listings:", error);
  }

  const paidListingsContent: PaidListing[] = listingsRaw.map((listing) => ({
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    priceLabel: formatEuroFromCents(listing.priceEurCents) ?? "Cena na upit",
    href: `/listing/${listing.id}`,
    imageUrl: listing.photos[0]?.url ?? null,
    locationLabel: null,
    sellerLabel: null,
    isVerifiedSeller: Boolean(listing.seller?.isVerified),
    sellerProfileSlug: listing.seller?.sellerProfile?.slug ?? null,
  }));

  return <PaidListings listings={paidListingsContent} />;
}
