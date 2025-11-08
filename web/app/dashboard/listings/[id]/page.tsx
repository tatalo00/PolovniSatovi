import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";
import { ListingImageGallery } from "@/components/listings/listing-image-gallery";
import { ListingSpecsTable } from "@/components/listings/listing-specs-table";
import { PriceDisplay } from "@/components/currency/price-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusMeta: Record<ListingStatus, { label: string; description: string }> = {
  DRAFT: {
    label: "Nacrt",
    description: "Oglas je u nacrtu. Dovršite sve detalje i pošaljite na odobrenje kada budete spremni.",
  },
  PENDING: {
    label: "Čeka odobrenje",
    description:
      "Oglas je poslat na odobrenje. Naš tim će ga pregledati i objaviti čim bude spreman.",
  },
  APPROVED: {
    label: "Odobren",
    description: "Oglas je aktivan i vidljiv kupcima na tržištu.",
  },
  REJECTED: {
    label: "Odbijen",
    description:
      "Oglas je odbijen. Ažurirajte informacije i ponovo pošaljite na odobrenje ako želite da ga objavite.",
  },
  ARCHIVED: {
    label: "Arhiviran",
    description: "Oglas je arhiviran i nije vidljiv kupcima.",
  },
  SOLD: {
    label: "Prodat",
    description: "Oglas je označen kao prodat i više nije vidljiv kupcima.",
  },
};

const conditionLabels: Record<string, string> = {
  New: "Novo",
  "Like New": "Kao novo",
  Excellent: "Odlično",
  "Very Good": "Vrlo dobro",
  Good: "Dobro",
  Fair: "Zadovoljavajuće",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingPreviewPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

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

  if (!listing) {
    notFound();
  }

  const isOwner = listing.sellerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const statusInfo = statusMeta[listing.status];
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
      value: conditionLabels[listing.condition] || listing.condition,
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

  const memberSince = new Intl.DateTimeFormat("sr-RS", {
    month: "long",
    year: "numeric",
  }).format(listing.seller.createdAt);

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pregled oglasa
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {statusInfo?.description ?? "Interni prikaz oglasa"}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge>{statusInfo?.label ?? listing.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Kreiran {new Intl.DateTimeFormat("sr-RS").format(listing.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/listings">← Nazad na moje oglase</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/listings/${listing.id}/edit`}>Izmeni oglas</Link>
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
                <CardTitle className="text-xl font-semibold">
                  {listing.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold text-primary">
                  <PriceDisplay amountEurCents={listing.priceEurCents} />
                </div>
                <ListingSpecsTable specs={specs} boxPapersStatus={listing.boxPapers || null} />
                {listing.description && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground">Opis</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                      {listing.description}
                    </p>
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
                <p className="font-medium">
                  {listing.seller.name?.trim() || listing.seller.email}
                </p>
                {locationParts.length > 0 && (
                  <p className="text-muted-foreground">{locationParts.join(", ")}</p>
                )}
              </div>
              <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Član od {memberSince}
              </div>
              <p className="text-xs text-muted-foreground">
                Ovaj prikaz je vidljiv samo vama i administratorima. Kontakt forma i javne
                informacije nisu prikazane dok oglas ne bude odobren.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalji moderacije</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Trenutni status: <span className="font-medium text-foreground">{statusInfo?.label ?? listing.status}</span></p>
              <p>
                Poslednja izmena: {new Intl.DateTimeFormat("sr-RS", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(listing.updatedAt)}
              </p>
              {!isOwner && (
                <p>Prodavac: {listing.seller.email}</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
