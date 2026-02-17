import type { Listing, ListingPhoto } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Hero } from "./hero";

type ListingWithRelations = Listing & {
  photos: ListingPhoto[];
  seller: {
    locationCity: string | null;
    locationCountry: string | null;
  } | null;
};

async function getHeroData() {
  "use cache";
  cacheLife("hours");
  cacheTag("listings");

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
}

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

  // Determine the hero image URL for preloading
  const heroImageSrc =
    featuredListings.find((l) => l.photoUrl)?.photoUrl ??
    "/images/hero-pocket-watch.jpg";

  // Build the preload href through Next.js image optimizer
  const preloadHref = heroImageSrc.startsWith("/")
    ? `/_next/image?url=${encodeURIComponent(heroImageSrc)}&w=1920&q=75`
    : `/_next/image?url=${encodeURIComponent(heroImageSrc)}&w=1920&q=75`;

  return (
    <>
      {/* React 19 hoists <link> to <head> automatically */}
      <link
        rel="preload"
        as="image"
        href={preloadHref}
        // @ts-expect-error -- fetchpriority is valid HTML but not yet in React types
        fetchpriority="high"
      />
      <Hero
        featuredListings={featuredListings}
        totalListings={totalListings}
        totalSellers={totalSellers}
      />
    </>
  );
}
