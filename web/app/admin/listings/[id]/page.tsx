import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingImageGallery } from "@/components/listings/listing-image-gallery";
import { ListingSpecsTable } from "@/components/listings/listing-specs-table";
import { PriceDisplay } from "@/components/currency/price-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const statusLabels: Record<ListingStatus, string> = {
  DRAFT: "Nacrt",
  PENDING: "Čeka odobrenje",
  APPROVED: "Odobren",
  REJECTED: "Odbijen",
  SOLD: "Prodat",
  ARCHIVED: "Arhiviran",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminListingDetailPage({ params }: PageProps) {
  await requireAdmin();

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
      statusAudits: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const locationParts = [listing.location, listing.seller.locationCity, listing.seller.locationCountry]
    .filter(Boolean)
    .map((part) => part?.toString().trim())
    .filter((part): part is string => Boolean(part && part.length > 0));

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
      value: listing.caseDiameterMm ? `${listing.caseDiameterMm} mm` : null,
    },
    { label: "Materijal kućišta", value: listing.caseMaterial },
    { label: "Mehanizam", value: listing.movement },
    {
      label: "Stanje",
      value: listing.condition,
    },
    {
      label: "Lokacija",
      value: locationParts.length > 0 ? locationParts.join(", ") : null,
    },
    {
      label: "Box / papiri",
      value: listing.boxPapers || null,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pregled oglasa (admin)</h1>
          <div className="mt-3 flex items-center gap-2">
            <Badge>{statusLabels[listing.status] ?? listing.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Kreiran {new Intl.DateTimeFormat("sr-RS").format(listing.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/listings">← Nazad na listu</Link>
          </Button>
          {listing.status === "APPROVED" && (
            <Button variant="outline" asChild>
              <Link href={`/listing/${listing.id}`} target="_blank">
                Otvori javnu stranicu
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <section aria-label="Galerija fotografija">
            <ListingImageGallery photos={listing.photos} title={listing.title} />
          </section>

          <section className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">{listing.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold text-primary">
                  <PriceDisplay amountEurCents={listing.priceEurCents} />
                </div>
                <ListingSpecsTable specs={specs} boxPapersStatus={listing.boxPapers || null} />
                {listing.description && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground">Opis</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{listing.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Podaci o prodavcu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">{listing.seller.name?.trim() || listing.seller.email}</p>
                <p className="text-muted-foreground">{listing.seller.email}</p>
                {locationParts.length > 0 && <p className="text-muted-foreground">{locationParts.join(", ")}</p>}
              </div>
              <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Član od {new Intl.DateTimeFormat("sr-RS", { month: "long", year: "numeric" }).format(listing.seller.createdAt)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Istorija statusa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {listing.statusAudits.length === 0 ? (
                <p>Nema zabeleženih promena statusa.</p>
              ) : (
                listing.statusAudits.map((audit) => (
                  <div key={audit.id} className="space-y-1">
                    <p className="text-foreground">
                      {statusLabels[audit.status] ?? audit.status}
                    </p>
                    <p>
                      {new Intl.DateTimeFormat("sr-RS", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(audit.createdAt)}
                    </p>
                    {audit.user && (
                      <p>
                        {audit.user.name?.trim() || audit.user.email} ({audit.user.email})
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
