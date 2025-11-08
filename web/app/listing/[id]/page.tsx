import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ListingViewTracker } from "@/components/listings/listing-view-tracker";
import { ListingImageGallery } from "@/components/listings/listing-image-gallery";
import { ListingReviewsSection } from "@/components/reviews/listing-reviews-section";
import { ListingSpecsTable } from "@/components/listings/listing-specs-table";
import { ListingContactCard } from "@/components/listings/listing-contact-card";
import { ListingStickyCTA } from "@/components/listings/listing-sticky-cta";
import { WishlistButton } from "@/components/listings/wishlist-button";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

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

type SellerSummary = {
  id: string;
  name: string | null;
  email: string;
  locationCity: string | null;
  locationCountry: string | null;
  createdAt: Date;
};

function SellerInfoCard({
  seller,
  locationLabel,
  memberSince,
  className,
}: {
  seller: SellerSummary;
  locationLabel: string | null;
  memberSince: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Prodavac</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-base font-semibold">
            {seller.name?.trim() || seller.email}
          </p>
          {locationLabel && (
            <p className="text-sm text-muted-foreground">{locationLabel}</p>
          )}
        </div>
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Član od{" "}
          <span className="font-medium text-foreground">{memberSince}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
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
        },
      },
    },
  });

  if (
    !listing ||
    (listing.status !== "APPROVED" && listing.status !== "SOLD")
  ) {
    notFound();
  }

  const session = await auth();
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
  const isSold = listing.status === "SOLD";
  const conditionLabels: Record<string, string> = {
    New: "Novo",
    "Like New": "Kao novo",
    Excellent: "Odlično",
    "Very Good": "Vrlo dobro",
    Good: "Dobro",
    Fair: "Zadovoljavajuće",
  };

  const sellerLocationParts = [
    listing.seller.locationCity,
    listing.seller.locationCountry,
  ].filter(Boolean);
  const sellerLocation =
    sellerLocationParts.length > 0 ? sellerLocationParts.join(", ") : null;
  const overallLocation =
    listing.location || sellerLocation || null;

  const specs = [
    { label: "Marka", value: listing.brand },
    { label: "Model", value: listing.model },
    { label: "Referenca", value: listing.reference },
    {
      label: "Godina proizvodnje",
      value: listing.year ? listing.year.toString() : null,
    },
    {
      label: "Prečnik kućišta",
      value: listing.caseDiameterMm
        ? `${listing.caseDiameterMm} mm`
        : null,
    },
    { label: "Materijal kućišta", value: listing.caseMaterial },
    { label: "Mehanizam", value: listing.movement },
    {
      label: "Stanje",
      value: conditionLabels[listing.condition] || listing.condition,
    },
    { label: "Lokacija", value: overallLocation },
  ];

  const isOwner = session?.user?.id === listing.seller.id;
  const memberSince = new Intl.DateTimeFormat("sr-RS", {
    month: "long",
    year: "numeric",
  }).format(listing.seller.createdAt);

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
    <main className="container mx-auto px-4 pt-8 pb-28 lg:pb-12">
      <ListingStickyCTA
        priceEurCents={listing.priceEurCents}
        contactTargetId="contact-seller"
        isOwner={isOwner}
        isSold={isSold}
      />
      <ListingViewTracker listingId={listing.id} listingTitle={listing.title} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />

      <Breadcrumbs
        items={[
          { label: "Oglasi", href: "/listings" },
          {
            label: listing.brand,
            href: `/listings?brand=${encodeURIComponent(listing.brand)}`,
          },
          { label: listing.title },
        ]}
        className="mb-4"
      />

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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <section aria-label="Galerija fotografija">
            <ListingImageGallery photos={listing.photos} title={listing.title} />
          </section>

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
                  <WishlistButton
                    listingId={listing.id}
                    initialIsFavorite={isFavorited}
                    className="ml-auto h-10 w-10 bg-background/90 shadow-sm"
                  />
                )}
              </div>
              <p className="text-muted-foreground">
                {listing.brand} {listing.model}
                {listing.reference && ` • Referenca ${listing.reference}`}
              </p>
            </header>

            <ListingSpecsTable
              specs={specs}
              boxPapersStatus={listing.boxPapers || null}
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
                seller={listing.seller}
                locationLabel={sellerLocation}
                memberSince={memberSince}
              />
            </div>

            <div className="lg:hidden" id="contact-seller" tabIndex={-1}>
              <ListingContactCard
                priceEurCents={listing.priceEurCents}
                listingId={listing.id}
                listingTitle={listing.title}
                sellerEmail={listing.seller.email}
                sellerId={listing.seller.id}
                isOwner={isOwner}
                isSold={isSold}
                showReport={!isSold}
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
        </div>

        <aside className="hidden lg:flex lg:flex-col">
          <div className="sticky top-24 flex flex-col gap-6">
            <ListingContactCard
              priceEurCents={listing.priceEurCents}
              listingId={listing.id}
              listingTitle={listing.title}
              sellerEmail={listing.seller.email}
              sellerId={listing.seller.id}
              isOwner={isOwner}
              isSold={isSold}
              showReport={!isSold}
            />
            <SellerInfoCard
              seller={listing.seller}
              locationLabel={sellerLocation}
              memberSince={memberSince}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

