import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactSellerForm } from "@/components/listings/contact-seller-form";
import { ReportListingForm } from "@/components/listings/report-listing-form";
import { PriceDisplay } from "@/components/currency/price-display";
import { ListingViewTracker } from "@/components/listings/listing-view-tracker";
import { Metadata } from "next";

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
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-2">
                {listing.photos.length > 0 ? (
                  <>
                    <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    {listing.photos.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 p-2">
                        {listing.photos.slice(1).map((photo, index) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square w-full overflow-hidden rounded"
                          >
                            <Image
                              src={photo.url}
                              alt={`${listing.title} ${index + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-muted rounded-t-lg">
                    <span className="text-muted-foreground">Nema slike</span>
                  </div>
                )}
              </div>
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
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                <PriceDisplay amountEurCents={listing.priceEurCents} showSwitcher />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContactSellerForm
                listingId={listing.id}
                listingTitle={listing.title}
                sellerEmail={listing.seller.email}
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
    </main>
  );
}

