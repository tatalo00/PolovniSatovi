import type { Listing, ListingPhoto, Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { PopularBrands } from "@/components/home/popular-brands";
import { RecentListings } from "@/components/home/recent-listings";
import { PriceSegments } from "@/components/home/price-segments";
import { TrustSafetyHighlights } from "@/components/home/trust-safety";
import { EducationHub } from "@/components/home/education-hub";
import { RegionalHighlights } from "@/components/home/regional-focus";
import { POPULAR_BRANDS_LOOKUP } from "@/lib/brands";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = "force-dynamic";

type ListingWithRelations = Listing & {
  photos: ListingPhoto[];
  seller: {
    locationCity: string | null;
    locationCountry: string | null;
  } | null;
};
type BrandAggregate = {
  brand: string | null;
  _count: { _all: number };
  _min: { priceEurCents: number | null };
};

const PRICE_SEGMENTS = [
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

export default async function HomePage() {
  let featuredRaw: ListingWithRelations[] = [];
  let recentRaw: ListingWithRelations[] = [];
  let brandAggregates: BrandAggregate[] = [];
  let totalListings = 0;
  let totalSellers = 0;
  let preferredLocation: string | null = null;
  let brandCards: Array<{
    name: string;
    description?: string;
    listingsCount: number;
    startingPriceEurCents: number | null;
    topModels: string[];
    verified?: boolean;
  }> = [];
  let priceSegmentsData: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    listingsCount: number;
    featuredBrands: string[];
    imageUrl: string | null;
    href: string;
  }> = [];
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
  let favoriteListingIds: string[] = [];
  let regionalHighlights: Array<{
    id: string;
    title: string;
    brand: string;
    model: string;
    priceEurCents: number;
    condition: string | null;
    locationLabel: string | null;
    createdAt: string;
    photoUrl: string | null;
  }> = [];
  let regionalLabel: string | null = null;

  const session = await auth();

  try {
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          locationCity: true,
          locationCountry: true,
        },
      });
      if (user?.locationCity) {
        preferredLocation = user.locationCountry
          ? `${user.locationCity}, ${user.locationCountry}`
          : user.locationCity;
      }
    }

    const favoritesPromise = session?.user?.id
      ? prisma.favorite.findMany({
          where: { userId: session.user.id },
          select: { listingId: true },
        })
      : Promise.resolve([]);

    const [featuredResult, recentResult, brandStats, counts, favorites] = await Promise.all([
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
      prisma.listing.groupBy({
        where: { status: "APPROVED" },
        by: ["brand"],
        _count: { _all: true },
        _min: { priceEurCents: true },
        orderBy: {
          _count: {
            brand: "desc",
          },
        },
        take: 16,
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
      favoritesPromise,
    ]);

    featuredRaw = featuredResult;
    recentRaw = recentResult;
    brandAggregates = brandStats;
    [totalListings, totalSellers] = counts;
    favoriteListingIds = (favorites as Array<{ listingId: string }>).map(
      (favorite) => favorite.listingId
    );

    const modelsByBrand = new Map<string, string[]>();
    const collectModels = (brand?: string | null, model?: string | null) => {
      if (!brand || !model) return;
      const bucket = modelsByBrand.get(brand) ?? [];
      if (!bucket.includes(model) && bucket.length < 5) {
        bucket.push(model);
        modelsByBrand.set(brand, bucket);
      }
    };

    for (const listing of recentRaw) {
      collectModels(listing.brand, listing.model);
    }

    for (const listing of featuredRaw) {
      collectModels(listing.brand, listing.model);
    }

    brandCards = brandAggregates
      .filter((row) => row.brand)
      .map((row) => {
        const name = row.brand!;
        const meta = POPULAR_BRANDS_LOOKUP.get(name.toLowerCase());
        const topModels = (modelsByBrand.get(name) ?? []).slice(0, 3);
        const verified =
          meta && "verified" in meta ? Boolean((meta as { verified?: boolean }).verified) : false;
        return {
          name,
          description: meta?.description,
          listingsCount: row._count._all,
          startingPriceEurCents: row._min.priceEurCents,
          topModels,
          verified,
        };
      });

    recentListings = recentRaw.map((listing) => {
      const sellerLocation = listing.seller
        ? [listing.seller.locationCity, listing.seller.locationCountry]
            .filter(Boolean)
            .join(", ")
        : null;
      const locationLabel = listing.location
        ? listing.location
        : sellerLocation || null;
      return {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        reference: listing.reference ?? null,
        priceEurCents: listing.priceEurCents,
        condition: listing.condition ?? null,
        locationLabel,
        createdAt: listing.createdAt.toISOString(),
        photos: listing.photos.map((photo) => ({ url: photo.url })),
      };
    });

    const mapPriceFilter = (segment: (typeof PRICE_SEGMENTS)[number]): Prisma.ListingWhereInput => {
      const priceFilter: Prisma.IntFilter = {};
      if (typeof segment.min === "number") {
        priceFilter.gte = Math.round(segment.min * 100);
      }
      if (typeof segment.max === "number") {
        priceFilter.lte = Math.round(segment.max * 100);
      }
      return Object.keys(priceFilter).length
        ? { status: "APPROVED", priceEurCents: priceFilter }
        : { status: "APPROVED" };
    };

    priceSegmentsData = await Promise.all(
      PRICE_SEGMENTS.map(async (segment) => {
        const where = mapPriceFilter(segment);
        const [count, sampleListing, brandGroups] = await Promise.all([
          prisma.listing.count({ where }),
          prisma.listing.findFirst({
            where,
            include: {
              photos: {
                orderBy: { order: "asc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
          }),
          prisma.listing.groupBy({
            where,
            by: ["brand"],
            _count: { _all: true },
            orderBy: {
              _count: {
                brand: "desc",
              },
            },
            take: 4,
          }),
        ]);

        const featuredBrands = brandGroups
          .map((group) => group.brand)
          .filter((name): name is string => Boolean(name))
          .slice(0, 3);

        const params = new URLSearchParams(segment.query);

        return {
          id: segment.id,
          title: segment.title,
          subtitle: segment.subtitle,
          description: segment.description,
          listingsCount: count,
          featuredBrands,
          imageUrl: sampleListing?.photos[0]?.url ?? null,
          href: params.toString() ? `/listings?${params.toString()}` : "/listings",
        };
      })
    );

    const fetchRegionalListings = async (city: string) =>
      prisma.listing.findMany({
        where: {
          status: "APPROVED",
          OR: [
            { location: { contains: city, mode: "insensitive" } },
            { seller: { locationCity: { contains: city, mode: "insensitive" } } },
          ],
        },
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
        take: 8,
      });

    const mapRegional = (rows: ListingWithRelations[]) =>
      rows.map((listing) => {
        const sellerLocation = listing.seller
          ? [listing.seller.locationCity, listing.seller.locationCountry]
              .filter(Boolean)
              .join(", ")
          : null;
        const locationLabel = listing.location
          ? listing.location
          : sellerLocation || null;
        return {
          id: listing.id,
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          priceEurCents: listing.priceEurCents,
          condition: listing.condition ?? null,
          locationLabel,
          createdAt: listing.createdAt.toISOString(),
          photoUrl: listing.photos[0]?.url ?? null,
        };
      });

    const preferredCity =
      preferredLocation?.split(",")[0]?.trim() ?? null;

    if (preferredCity) {
      const rows = await fetchRegionalListings(preferredCity);
      if (rows.length) {
        regionalHighlights = mapRegional(rows);
        regionalLabel = preferredCity;
      }
    }

    if (!regionalHighlights.length) {
      const topLocation = await prisma.listing.groupBy({
        where: {
          status: "APPROVED",
          location: { not: null },
        },
        by: ["location"],
        _count: { _all: true },
        orderBy: {
          _count: {
            location: "desc",
          },
        },
        take: 1,
      });

      const fallbackCity =
        (topLocation[0]?.location ?? null) ||
        recentRaw.find((listing) => listing.location)?.location ||
        recentRaw.find((listing) => listing.seller?.locationCity)?.seller?.locationCity ||
        null;

      if (fallbackCity) {
        const rows = await fetchRegionalListings(fallbackCity);
        regionalHighlights = mapRegional(rows);
        regionalLabel = fallbackCity;
      }
    }
  } catch (error: unknown) {
    console.error("Database error on homepage:", error);
    // Continue with whatever data was fetched
  }

  if (!priceSegmentsData.length) {
    priceSegmentsData = PRICE_SEGMENTS.map((segment) => {
      const params = new URLSearchParams(segment.query);
      return {
        id: segment.id,
        title: segment.title,
        subtitle: segment.subtitle,
        description: segment.description,
        listingsCount: 0,
        featuredBrands: [],
        imageUrl: null,
        href: params.toString() ? `/listings?${params.toString()}` : "/listings",
      };
    });
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

  if (!regionalHighlights.length && recentListings.length) {
    regionalHighlights = recentListings.slice(0, 4).map((listing) => ({
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      priceEurCents: listing.priceEurCents,
      condition: listing.condition,
      locationLabel: listing.locationLabel,
      createdAt: listing.createdAt,
      photoUrl: listing.photos[0]?.url ?? null,
    }));
  }

  if (!regionalLabel) {
    regionalLabel =
      preferredLocation?.split(",")[0]?.trim() ??
      regionalHighlights[0]?.locationLabel ??
      "Vaš region";
  }

  return (
    <main>
      <Hero
        featuredListings={featuredListings}
        totalListings={totalListings}
        totalSellers={totalSellers}
        userLocation={preferredLocation}
      />
      <PopularBrands brands={brandCards} />
      <RecentListings listings={recentListings} favoriteIds={favoriteListingIds} />
      <PriceSegments segments={priceSegmentsData} />
      <TrustSafetyHighlights />
      <EducationHub />
      <RegionalHighlights listings={regionalHighlights} regionLabel={regionalLabel} />
    </main>
  );
}
