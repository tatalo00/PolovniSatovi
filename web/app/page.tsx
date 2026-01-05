import type { Listing, ListingPhoto } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import type { PaidListing } from "@/components/home/featured-collections";
import { QuickFilterBar } from "@/components/home/quick-filter-bar";
import { PaidListings } from "@/components/home/featured-collections";
import { RecentListings } from "@/components/home/recent-listings";
import { TrustServices } from "@/components/home/trust-services";
import { EducationHub } from "@/components/home/education-hub";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

// Revalidate homepage every 5 minutes
export const revalidate = 300;

type ListingWithRelations = Listing & {
  photos: ListingPhoto[];
  seller: {
    locationCity: string | null;
    locationCountry: string | null;
  } | null;
};
const _PRICE_SEGMENTS = [
  {
    id: "budget",
    title: "Budget Collectors",
    subtitle: "Ispod €500",
    description: "Savršeno za početnike i vintage istraživače.",
    min: 0,
    max: 500,
    query: { max: "500" },
  },
  {
    id: "mid-range",
    title: "Mid-Range Enthusiasts",
    subtitle: "€500 – €2.000",
    description: "Kultni modeli i pouzdani automatski satovi.",
    min: 500,
    max: 2000,
    query: { min: "500", max: "2000" },
  },
  {
    id: "serious",
    title: "Serious Collectors",
    subtitle: "€2.000 – €5.000",
    description: "Premijum švajcarske kuće i limitirane serije.",
    min: 2000,
    max: 5000,
    query: { min: "2000", max: "5000" },
  },
  {
    id: "luxury",
    title: "Luxury Segment",
    subtitle: "€5.000+",
    description: "Komplikacije, retki vintage i investicioni komadi.",
    min: 5000,
    max: undefined,
    query: { min: "5000" },
  },
] as const;

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

// Cached function to fetch homepage listings data
const getHomepageListings = unstable_cache(
  async () => {
    const [featuredResult, recentResult, counts, distinctBrands] = await Promise.all([
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
        orderBy: { createdAt: "desc" },
        take: 12,
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
      prisma.listing.findMany({
        where: {
          status: "APPROVED",
        },
        distinct: ["brand"],
        select: { brand: true },
      }),
    ]);

    return {
      featuredResult,
      recentResult,
      counts,
      distinctBrands,
    };
  },
  ["homepage-listings"],
  {
    tags: [CACHE_TAGS.listings],
    revalidate: REVALIDATE.MEDIUM,
  }
);

export default async function HomePage() {
  let featuredRaw: ListingWithRelations[] = [];
  let recentRaw: ListingWithRelations[] = [];
  let totalListings = 0;
  let totalSellers = 0;
  let recentListings: Array<{
    id: string;
    title: string;
    brand: string;
    model: string;
    reference: string | null;
    priceEurCents: number;
    condition: string | null;
    locationLabel: string | null;
    createdAt: string;
    photos: Array<{ url: string }>;
  }> = [];
  let availableBrands: string[] = [];

  try {
    // Fetch cached listings data
    const { featuredResult, recentResult, counts, distinctBrands } = await getHomepageListings();

    featuredRaw = featuredResult;
    recentRaw = recentResult;
    [totalListings, totalSellers] = counts;
    availableBrands = (distinctBrands as Array<{ brand: string | null }>)
      .map((entry) => entry.brand)
      .filter((brandName): brandName is string => Boolean(brandName));

    recentListings = recentRaw.map((listing) => {
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

  } catch (error: unknown) {
    console.error("Database error on homepage:", error);
    // Continue with whatever data was fetched
  }

  const featuredListings = featuredRaw.map((listing) => ({
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    title: listing.title,
    priceEurCents: listing.priceEurCents,
    condition: listing.condition,
    photoUrl: listing.photos[0]?.url,
  }));

  const paidListingsContent: PaidListing[] = featuredListings.slice(0, 6).map((listing) => ({
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    priceLabel: formatEuroFromCents(listing.priceEurCents) ?? "Cena na upit",
    href: `/listing/${listing.id}`,
    imageUrl: listing.photoUrl ?? null,
    locationLabel: null,
    sellerLabel: null,
  }));

  return (
    <main>
      <Hero
        featuredListings={featuredListings}
        totalListings={totalListings}
        totalSellers={totalSellers}
      />
      <QuickFilterBar brands={availableBrands} />
      <PaidListings listings={paidListingsContent} />
      <RecentListings listings={recentListings} />
      <TrustServices />
      <EducationHub />
    </main>
  );
}
