import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactSellerForm } from "@/components/listings/contact-seller-form";
import { ReportListingForm } from "@/components/listings/report-listing-form";
import { PriceDisplay } from "@/components/currency/price-display";
import { ListingViewTracker } from "@/components/listings/listing-view-tracker";
import { ListingImageGallery } from "@/components/listings/listing-image-gallery";
import { ListingReviewsSection } from "@/components/reviews/listing-reviews-section";
import { Metadata } from "next";

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

  if (!listing || listing.status !== "APPROVED") {
    notFound();
  }


  const conditionLabels: Record<string, string> = {
    New: "Novo",
    "Like New": "Kao novo",
    Excellent: "Odlično",
    "Very Good": "Vrlo dobro",
    Good: "Dobro",
    Fair: "Zadovoljavajuće",
  };

  const boxPapersLabels: Record<string, string> = {
    "Full Set": "Komplet (box + papiri)",
    "Box Only": "Samo box",
    "Papers Only": "Samo papiri",
    "No Box or Papers": "Nema boxa ni papira",
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <ListingViewTracker listingId={listing.id} listingTitle={listing.title} />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <ListingImageGallery photos={listing.photos} title={listing.title} />
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>{listing.title}</CardTitle>
              <CardDescription>
                {listing.brand} {listing.model}
                {listing.reference && ` • Referenca: ${listing.reference}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-1">Marka</h4>
                  <p className="text-muted-foreground">{listing.brand}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Model</h4>
                  <p className="text-muted-foreground">{listing.model}</p>
                </div>
                {listing.reference && (
                  <div>
                    <h4 className="font-medium mb-1">Referenca</h4>
                    <p className="text-muted-foreground">{listing.reference}</p>
                  </div>
                )}
                {listing.year && (
                  <div>
                    <h4 className="font-medium mb-1">Godina proizvodnje</h4>
                    <p className="text-muted-foreground">{listing.year}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-1">Stanje</h4>
                  <Badge variant="outline">
                    {conditionLabels[listing.condition] || listing.condition}
                  </Badge>
                </div>
                {listing.boxPapers && (
                  <div>
                    <h4 className="font-medium mb-1">Box i papiri</h4>
                    <p className="text-muted-foreground">
                      {boxPapersLabels[listing.boxPapers] || listing.boxPapers}
                    </p>
                  </div>
                )}
                {listing.location && (
                  <div>
                    <h4 className="font-medium mb-1">Lokacija</h4>
                    <p className="text-muted-foreground">{listing.location}</p>
                  </div>
                )}
              </div>

              {listing.description && (
                <div>
                  <h4 className="font-medium mb-2">Opis</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Price Card - Sticky on mobile */}
          <Card className="sticky top-20 md:static z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                <PriceDisplay amountEurCents={listing.priceEurCents} showSwitcher />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContactSellerForm
                listingId={listing.id}
                listingTitle={listing.title}
                sellerEmail={listing.seller.email}
                sellerId={listing.seller.id}
              />
              <div className="pt-4 border-t">
                <ReportListingForm
                  listingId={listing.id}
                  listingTitle={listing.title}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle>Prodavac</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h4 className="font-medium">{listing.seller.name || listing.seller.email}</h4>
              </div>
              {(listing.seller.locationCity || listing.seller.locationCountry) && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    {listing.seller.locationCity && listing.seller.locationCountry
                      ? `${listing.seller.locationCity}, ${listing.seller.locationCountry}`
                      : listing.seller.locationCity || listing.seller.locationCountry}
                  </p>
                </div>
              )}
              <div className="text-xs text-muted-foreground pt-2">
                <p>
                  Član od {new Date(listing.seller.createdAt).toLocaleDateString("sr-RS")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <ListingReviewsSection
          listingId={listing.id}
          sellerId={listing.seller.id}
          sellerName={listing.seller.name || listing.seller.email}
        />
      </div>
    </main>
  );
}

