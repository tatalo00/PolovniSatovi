import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ListingViewTracker } from "@/components/listings/listing-view-tracker";
import { ListingImageGallery } from "@/components/listings/listing-image-gallery";
import { ListingSpecsAccordion } from "@/components/listings/listing-specs-accordion";
import { ListingContactCard } from "@/components/listings/listing-contact-card";
import { SellerInfoCard, type SellerSummary } from "@/components/listings/seller-info-card";
import { WishlistButton } from "@/components/listings/wishlist-button";
import { ShareButton } from "@/components/listings/share-button";
import { Prisma } from "@prisma/client";
import { AUTHENTICATION_STATUS, type AuthenticationStatus } from "@/lib/authentication/status";
import { SimilarListingsSection } from "@/components/listings/similar-listings-section";
import { BackToResults } from "@/components/listings/back-to-results";
import { computeSellerTier } from "@/lib/seller-tier";
import { formatResponseTime } from "@/lib/seller-response-time";
import dynamic from "next/dynamic";

// Dynamically import heavy components
const ListingReviewsSection = dynamic(
  () => import("@/components/reviews/listing-reviews-section").then((mod) => ({ default: mod.ListingReviewsSection })),
  {
    ssr: true,
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />
  }
);

const ListingStickyCTA = dynamic(
  () => import("@/components/listings/listing-sticky-cta").then((mod) => ({ default: mod.ListingStickyCTA })),
  { ssr: true }
);

type ListingWithSellerDetail = Prisma.ListingGetPayload<{
  include: {
    photos: true;
    seller: {
      select: {
        id: true;
        name: true;
        email: true;
        locationCity: true;
        locationCountry: true;
        createdAt: true;
        isVerified: true;
        authentication: {
          select: {
            status: true;
          };
        };
        sellerProfile: {
          select: {
            slug: true;
            storeName: true;
            shortDescription: true;
            logoUrl: true;
            heroImageUrl: true;
            ratingAvg: true;
            reviewCount: true;
            totalSoldCount: true;
            avgResponseTimeMinutes: true;
          };
        };
      };
    };
  };
}>;

// Revalidate listing pages every 5 minutes
export const revalidate = 300;

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      brand: true,
      model: true,
      description: true,
      priceEurCents: true,
      photos: { take: 1 },
    },
  });

  if (!listing) {
    return {
      title: "Oglas nije pronađen",
    };
  }

  return {
    title: listing.title,
    description: listing.description || `${listing.brand} ${listing.model}`,
    openGraph: {
      title: listing.title,
      description: listing.description || `${listing.brand} ${listing.model}`,
      images: listing.photos[0]?.url ? [listing.photos[0].url] : [],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = (await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          locationCity: true,
          locationCountry: true,
          createdAt: true,
          isVerified: true,
          authentication: {
            select: {
              status: true,
            },
          },
          sellerProfile: {
            select: {
              slug: true,
              storeName: true,
              shortDescription: true,
              logoUrl: true,
              heroImageUrl: true,
              ratingAvg: true,
              reviewCount: true,
              totalSoldCount: true,
              avgResponseTimeMinutes: true,
            },
          },
        },
      },
    },
  })) as ListingWithSellerDetail | null;

  if (
    !listing ||
    (listing.status !== "APPROVED" && listing.status !== "SOLD")
  ) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Parallel queries: auth, seller stats, review data, favorites count
  const [session, sellerListingCounts, sellerReviewData, favoritesCount] = await Promise.all([
    auth(),
    prisma.listing.groupBy({
      by: ['status'],
      where: { sellerId: listing.seller.id },
      _count: { id: true },
    }),
    prisma.review.aggregate({
      where: { sellerId: listing.seller.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.favorite.count({ where: { listingId: id } }),
  ]);

  const viewerId = session?.user?.id;

  let isFavorited = false;
  if (viewerId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: viewerId,
          listingId: id,
        },
      },
      select: { id: true },
    });
    isFavorited = Boolean(favorite);
  }

  // Seller stats
  const sellerProfile = listing.seller.sellerProfile;
  const activeListings = sellerListingCounts.find(s => s.status === 'APPROVED')?._count.id ?? 0;
  const totalSold = sellerListingCounts.find(s => s.status === 'SOLD')?._count.id ?? 0;
  const sellerRating = sellerReviewData._avg.rating ? Number(sellerReviewData._avg.rating) : null;
  const sellerReviewCount = sellerReviewData._count.rating ?? 0;
  const sellerTotalSold = sellerProfile?.totalSoldCount || (totalSold > 0 ? totalSold : 0);
  const sellerStats = {
    activeListings,
    totalSold: sellerTotalSold > 0 ? sellerTotalSold : undefined,
    avgResponseTime: formatResponseTime(sellerProfile?.avgResponseTimeMinutes) ?? undefined,
  };
  const sellerTier = computeSellerTier({
    totalSold: sellerTotalSold,
    ratingAvg: sellerRating,
    avgResponseTimeMinutes: sellerProfile?.avgResponseTimeMinutes,
  });

  const isSold = listing.status === "SOLD";

  const sellerLocationParts = [
    listing.seller.locationCity,
    listing.seller.locationCountry,
  ].filter(Boolean);
  const sellerLocation =
    sellerLocationParts.length > 0 ? sellerLocationParts.join(", ") : null;
  const overallLocation =
    listing.location || sellerLocation || null;

  const isOwner = session?.user?.id === listing.seller.id;
  const isVerifiedSeller = listing.seller.isVerified;
  const sellerAuthStatus =
    (listing.seller.authentication?.status ?? null) as AuthenticationStatus | null;
  const isAuthenticatedSeller =
    !isVerifiedSeller && sellerAuthStatus === AUTHENTICATION_STATUS.APPROVED;
  const sellerBadge = isVerifiedSeller
    ? { label: "Verifikovani prodavac", type: "verified" as const }
    : isAuthenticatedSeller
    ? { label: "Autentifikovani korisnik", type: "authenticated" as const }
    : null;
  const memberSince = new Intl.DateTimeFormat("sr-RS", {
    month: "long",
    year: "numeric",
  }).format(listing.seller.createdAt);
  const sellerDetails: SellerSummary = {
    id: listing.seller.id,
    name: listing.seller.name,
    email: listing.seller.email,
    locationCity: listing.seller.locationCity,
    locationCountry: listing.seller.locationCountry,
    createdAt: listing.seller.createdAt,
    isVerified: listing.seller.isVerified,
    authenticationStatus: sellerAuthStatus,
    storeName: sellerProfile?.storeName ?? listing.seller.name,
    shortDescription: sellerProfile?.shortDescription ?? null,
    profileSlug: sellerProfile?.slug ?? null,
    logoUrl: sellerProfile?.logoUrl ?? null,
  };

  const conditionSchemaMap: Record<string, string> = {
    New: "https://schema.org/NewCondition",
    "Like New": "https://schema.org/RefurbishedCondition",
    Excellent: "https://schema.org/UsedCondition",
    "Very Good": "https://schema.org/UsedCondition",
    Good: "https://schema.org/UsedCondition",
    Fair: "https://schema.org/UsedCondition",
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    brand: listing.brand,
    model: listing.model,
    description: listing.description || `${listing.brand} ${listing.model}`,
    sku: listing.reference || undefined,
    image: listing.photos.map((photo) => photo.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (listing.priceEurCents / 100).toFixed(2),
      availability: isSold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition:
        conditionSchemaMap[listing.condition] ||
        "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization",
        name: listing.seller.name?.trim() || listing.seller.email,
        address:
          sellerLocationParts.length > 0
            ? {
                "@type": "PostalAddress",
                addressLocality: listing.seller.locationCity || undefined,
                addressCountry: listing.seller.locationCountry || undefined,
              }
            : undefined,
      },
    },
  };

  const structuredDataJson = JSON.stringify(structuredData).replace(
    /</g,
    "\\u003c"
  );

  return (
    <main className="container mx-auto px-4 pt-8 mobile-bottom-padding lg:pb-12">
      <ListingViewTracker listingId={listing.id} listingTitle={listing.title} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumbs
          items={[
            { label: "Oglasi", href: "/listings" },
            {
              label: listing.brand,
              href: `/listings?brand=${encodeURIComponent(listing.brand)}`,
            },
            { label: listing.title },
          ]}
        />
        <BackToResults />
      </div>

      {isOwner && (
        <div className="mb-6 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm md:text-base">
          <p className="font-semibold text-primary">
            Ovo je vaš oglas
          </p>
          <p className="text-muted-foreground">
            Pregledajte informacije i ažurirajte ih po potrebi. Kupci će videti kontakt formu umesto ove poruke.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:content-start">
        <div className="space-y-8">
          <section aria-label="Galerija fotografija">
            <ListingImageGallery photos={listing.photos} title={listing.title} isVerifiedSeller={isVerifiedSeller} />
          </section>

          {/* Contact card below image - mobile only */}
          <div id="contact-seller" tabIndex={-1} className="lg:hidden">
            <ListingContactCard
              priceEurCents={listing.priceEurCents}
              currency={listing.currency as "EUR" | "RSD" | undefined}
              listingId={listing.id}
              listingTitle={listing.title}
              sellerEmail={listing.seller.email}
              sellerId={listing.seller.id}
              isOwner={isOwner}
              isSold={isSold}
              showReport={!isSold}
              sellerBadge={sellerBadge}
              sellerRating={sellerRating}
              sellerReviewCount={sellerReviewCount}
            />
          </div>

          <section aria-labelledby="listing-details" className="space-y-6">
            <header className="space-y-2" id="listing-details">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {listing.title}
                </h1>
                {isSold && (
                  <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                    PRODATO
                  </Badge>
                )}
                {!isOwner && (
                  <div className="ml-auto flex items-center gap-2">
                    {favoritesCount > 0 && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {favoritesCount} {favoritesCount === 1 ? "korisnik prati" : "korisnika prati"}
                      </span>
                    )}
                    <ShareButton
                      listingId={listing.id}
                      listingTitle={listing.title}
                      className="h-10 w-10 bg-background/90 shadow-sm"
                    />
                    <WishlistButton
                      listingId={listing.id}
                      initialIsFavorite={isFavorited}
                      className="h-10 w-10 bg-background/90 shadow-sm"
                    />
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">
                {listing.brand} {listing.model}
                {listing.reference && ` • Referenca ${listing.reference}`}
              </p>
            </header>

            <ListingSpecsAccordion
              listing={listing}
              location={overallLocation}
            />

            {listing.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Opis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="lg:hidden">
              <SellerInfoCard
                seller={sellerDetails}
                locationLabel={sellerLocation}
                memberSince={memberSince}
                badge={sellerBadge}
                stats={sellerStats}
                sellerTier={sellerTier}
              />
            </div>
          </section>

          <section className="space-y-4">
            <ListingReviewsSection
              listingId={listing.id}
              sellerId={listing.seller.id}
              sellerName={listing.seller.name || listing.seller.email}
            />
          </section>

          {/* Similar Watches */}
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
            <SimilarListingsSection
              listingId={listing.id}
              brand={listing.brand}
              priceEurCents={listing.priceEurCents}
            />
          </Suspense>
        </div>

        <aside className="hidden lg:block">
          <div 
            className="sticky top-20 flex flex-col gap-6 w-full"
            style={{ 
              position: 'sticky',
              top: '5rem',
              alignSelf: 'flex-start'
            }}
          >
            <div id="contact-seller" tabIndex={-1}>
              <ListingContactCard
                priceEurCents={listing.priceEurCents}
                listingId={listing.id}
                listingTitle={listing.title}
                sellerEmail={listing.seller.email}
                sellerId={listing.seller.id}
                isOwner={isOwner}
                isSold={isSold}
                showReport={!isSold}
                sellerBadge={sellerBadge}
                sellerRating={sellerRating}
                sellerReviewCount={sellerReviewCount}
              />
            </div>
            <SellerInfoCard
              seller={sellerDetails}
              locationLabel={sellerLocation}
              memberSince={memberSince}
              badge={sellerBadge}
              stats={sellerStats}
              sellerTier={sellerTier}
            />
          </div>
        </aside>
      </div>

      {/* Mobile Sticky CTA */}
      <ListingStickyCTA
        priceEurCents={listing.priceEurCents}
        currency={listing.currency as "EUR" | "RSD" | undefined}
        contactTargetId="contact-seller"
        isOwner={isOwner}
        isSold={isSold}
        listingId={listing.id}
        listingTitle={listing.title}
        sellerBadge={sellerBadge}
      />
    </main>
  );
}

