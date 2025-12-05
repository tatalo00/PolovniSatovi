import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { ListingGrid } from "@/components/listings/listing-grid";
import type { ListingSummary } from "@/types/listing";
import { AUTHENTICATION_STATUS } from "@/lib/authentication/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck, MapPin, Clock3, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

interface SellerPageProps {
  params: Promise<{ slug: string }>;
}

async function getSellerProfile(slug: string) {
  return prisma.sellerProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      storeName: true,
      description: true,
      shortDescription: true,
      logoUrl: true,
      heroImageUrl: true,
      locationCity: true,
      locationCountry: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          createdAt: true,
        },
      },
    },
  });
}

async function getSellerListings(userId: string) {
  return prisma.listing.findMany({
    where: {
      sellerId: userId,
      status: { in: ["APPROVED", "SOLD"] },
    },
    include: {
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
      seller: {
        select: {
          name: true,
          email: true,
          locationCity: true,
          locationCountry: true,
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
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function mapListingToSummary(listing: Awaited<ReturnType<typeof getSellerListings>>[number]) {
  const sellerEntity = listing.seller;
  const isAuthenticated =
    sellerEntity.authentication?.status === AUTHENTICATION_STATUS.APPROVED;
  
  const currency: "EUR" | "RSD" = (listing.currency === "EUR" || listing.currency === "RSD") 
    ? listing.currency 
    : "EUR";

  return {
    ...listing,
    currency,
    photos: listing.photos.map((photo) => ({ url: photo.url })),
    seller: {
      name: sellerEntity.name,
      email: sellerEntity.email,
      locationCity: sellerEntity.locationCity,
      locationCountry: sellerEntity.locationCountry,
      isVerified: sellerEntity.isVerified,
      isAuthenticated,
      profileSlug: sellerEntity.sellerProfile?.slug ?? null,
      storeName: sellerEntity.sellerProfile?.storeName ?? null,
      shortDescription: sellerEntity.sellerProfile?.shortDescription ?? null,
      logoUrl: sellerEntity.sellerProfile?.logoUrl ?? null,
    },
  } satisfies ListingSummary;
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getSellerProfile(slug);

  if (!profile || !profile.user.isVerified) {
    return { title: "Prodavac nije pronađen" };
  }

  return {
    title: `${profile.storeName} | Verified seller`,
    description:
      profile.shortDescription ||
      profile.description ||
      "Verifikovani prodavac na platformi PolovniSatovi.",
  };
}

export default async function SellerPublicProfilePage({ params }: SellerPageProps) {
  const { slug } = await params;
  const profile = await getSellerProfile(slug);

  if (!profile || !profile.user.isVerified) {
    notFound();
  }

  const listings = await getSellerListings(profile.user.id);
  const activeListings = listings
    .filter((listing) => listing.status === "APPROVED")
    .map(mapListingToSummary);
  const soldListings = listings
    .filter((listing) => listing.status === "SOLD")
    .slice(0, 6)
    .map((listing) => ({
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      priceEurCents: listing.priceEurCents,
    }));

  const memberSince = new Intl.DateTimeFormat("sr-RS", {
    month: "long",
    year: "numeric",
  }).format(profile.user.createdAt);

  const locationLabel = [profile.locationCity, profile.locationCountry].filter(Boolean).join(", ");

  const totalSoldCount = listings.filter((listing) => listing.status === "SOLD").length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Oglasi", href: "/listings" },
          { label: profile.storeName },
        ]}
        className="mb-2"
      />

      <section className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white">
        {profile.heroImageUrl && (
          <Image
            src={profile.heroImageUrl}
            alt={profile.storeName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/30" />
        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-12">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white/90 text-lg font-semibold text-neutral-900">
              {profile.logoUrl ? (
                <Image
                  src={profile.logoUrl}
                  alt={profile.storeName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {profile.storeName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/70">
                <ShieldCheck className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                Verifikovani prodavac
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {profile.storeName}
              </h1>
              {profile.shortDescription && (
                <p className="text-white/80 text-sm sm:text-base">
                  {profile.shortDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            {locationLabel && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <MapPin className="h-4 w-4" aria-hidden />
                {locationLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Clock3 className="h-4 w-4" aria-hidden />
              Član od {memberSince}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Package className="h-4 w-4" aria-hidden />
              Aktivne ponude: {activeListings.length}
            </span>
            {totalSoldCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                Prodato: {totalSoldCount}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="secondary"
              className="bg-white text-neutral-900 hover:bg-white/90"
            >
              <Link href={`mailto:${profile.user.email}`}>Kontaktiraj prodavca</Link>
            </Button>
            {profile.description && (
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                {profile.description.length > 60
                  ? `${profile.description.slice(0, 60)}…`
                  : profile.description}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-neutral-100 text-neutral-900">
                  Aktivne ponude
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {activeListings.length} {activeListings.length === 1 ? "oglas" : "oglasa"}
                </span>
              </div>
            </div>
            {activeListings.length > 0 ? (
              <ListingGrid listings={activeListings} columns={3} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-base font-medium text-foreground mb-1">
                    Trenutno nema aktivnih oglasa
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Proverite ponovo uskoro za nove ponude od ovog prodavca.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {soldListings.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Nedavno prodato</Badge>
                <span className="text-sm text-muted-foreground">
                  Poslednjih {soldListings.length} {soldListings.length === 1 ? "transakcija" : "transakcija"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {soldListings.map((listing) => (
                  <Card key={listing.id} className="border-dashed border-muted-foreground/30">
                    <CardContent className="space-y-1 py-4">
                      <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing.brand} • {listing.model}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground mt-1">Prodato</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>O prodavnici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              {profile.description ? (
                <p className="whitespace-pre-wrap">{profile.description}</p>
              ) : (
                <p className="text-muted-foreground/70">Prodavac još uvek nije dodao detaljan opis.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Aktivne ponude</span>
                <span className="font-semibold text-foreground">{activeListings.length}</span>
              </div>
              {totalSoldCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prodato ukupno</span>
                  <span className="font-semibold text-foreground">{totalSoldCount}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Član od</span>
                <span className="font-semibold text-foreground">{memberSince}</span>
              </div>
              {locationLabel && (
                <div className="flex items-start justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Lokacija</span>
                  <span className="font-medium text-foreground text-right">{locationLabel}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted px-4 py-3 text-sm">
                <p className="font-medium text-foreground mb-1">Email</p>
                <a
                  href={`mailto:${profile.user.email}`}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors break-all"
                >
                  {profile.user.email}
                </a>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={`mailto:${profile.user.email}`}>Kontaktiraj prodavca</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

