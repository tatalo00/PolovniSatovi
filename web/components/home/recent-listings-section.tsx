import type { Listing, ListingPhoto } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { RecentListings } from "./recent-listings";

type ListingWithRelations = Listing & {
  photos: ListingPhoto[];
  seller: {
    locationCity: string | null;
    locationCountry: string | null;
  } | null;
};

const getRecentListings = unstable_cache(
  async () => {
    const listings = await prisma.listing.findMany({
      where: { status: "APPROVED" },
      include: {
        photos: {
          orderBy: { order: "asc" },
          take: 1,
        },
        seller: {
          select: {
            locationCity: true,
            locationCountry: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return listings;
  },
  ["recent-listings"],
  {
    tags: [CACHE_TAGS.listings],
    revalidate: REVALIDATE.MEDIUM,
  }
);

export async function RecentListingsSection() {
  let listingsRaw: ListingWithRelations[] = [];

  try {
    listingsRaw = await getRecentListings();
  } catch (error) {
    console.error("Database error fetching recent listings:", error);
  }

  const recentListings = listingsRaw.map((listing) => {
    const sellerLocation = listing.seller
      ? [listing.seller.locationCity, listing.seller.locationCountry]
          .filter(Boolean)
          .join(", ")
      : null;
    const locationLabel = listing.location
      ? listing.location
      : sellerLocation || null;
    const createdAt = listing.createdAt instanceof Date
      ? listing.createdAt.toISOString()
      : typeof listing.createdAt === "string"
      ? listing.createdAt
      : new Date(listing.createdAt).toISOString();

    return {
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      reference: listing.reference ?? null,
      priceEurCents: listing.priceEurCents,
      condition: listing.condition ?? null,
      locationLabel,
      createdAt,
      photos: listing.photos.map((photo) => ({ url: photo.url })),
    };
  });

  return <RecentListings listings={recentListings} />;
}
