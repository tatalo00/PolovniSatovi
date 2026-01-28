import type { Listing, ListingPhoto } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { Hero } from "./hero";

type ListingWithRelations = Listing & {
  photos: ListingPhoto[];
  seller: {
    locationCity: string | null;
    locationCountry: string | null;
  } | null;
};

const getHeroData = unstable_cache(
  async () => {
    const [featuredResult, counts] = await Promise.all([
      prisma.listing.findMany({
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
        orderBy: [
          { priceEurCents: "desc" },
          { createdAt: "desc" },
        ],
        take: 5,
      }),
      Promise.all([
        prisma.listing.count({
          where: { status: "APPROVED" },
        }),
        prisma.user.count({
          where: {
            listings: {
              some: {
                status: "APPROVED",
              },
            },
          },
        }),
      ]),
    ]);

    return { featuredResult, counts };
  },
  ["hero-data"],
  {
    tags: [CACHE_TAGS.listings],
    revalidate: REVALIDATE.MEDIUM,
  }
);

export async function HeroSection() {
  let featuredRaw: ListingWithRelations[] = [];
  let totalListings = 0;
  let totalSellers = 0;

  try {
    const { featuredResult, counts } = await getHeroData();
    featuredRaw = featuredResult;
    [totalListings, totalSellers] = counts;
  } catch (error) {
    console.error("Database error fetching hero data:", error);
  }

  const featuredListings = featuredRaw.map((listing) => ({
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    title: listing.title,
    priceEurCents: listing.priceEurCents,
    condition: listing.condition ?? "",
    photoUrl: listing.photos[0]?.url,
  }));

  return (
    <Hero
      featuredListings={featuredListings}
      totalListings={totalListings}
      totalSellers={totalSellers}
    />
  );
}
