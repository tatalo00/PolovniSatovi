import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingWizard } from "@/components/listings/listing-wizard";
import {
  BOX_PAPERS_VALUES,
  CONDITION_VALUES,
  SUPPORTED_CURRENCIES,
  GENDER_VALUES,
} from "@/lib/validation/listing";

export const metadata = {
  title: "Izmeni Oglas",
  description: "Ažurirajte oglas za sat",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id: userId, role } = session.user;

  // Fetch listing
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!listing) {
    redirect("/dashboard/listings");
  }

  const listingForWizard = {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    reference: listing.reference,
    year: listing.year,
    caseDiameterMm: listing.caseDiameterMm,
    caseThicknessMm: listing.caseThicknessMm,
    caseMaterial: listing.caseMaterial,
    waterResistanceM: listing.waterResistanceM,
    movement: listing.movement,
    movementType: listing.movementType,
    caliber: listing.caliber,
    dialColor: listing.dialColor,
    dateDisplay: listing.dateDisplay,
    bezelType: listing.bezelType,
    bezelMaterial: listing.bezelMaterial,
    strapType: listing.strapType,
    braceletMaterial: listing.braceletMaterial,
    strapWidthMm: listing.strapWidthMm,
    warranty: listing.warranty,
    warrantyCard: listing.warrantyCard,
    originalOwner: listing.originalOwner,
    runningCondition: listing.runningCondition,
    condition: listing.condition as (typeof CONDITION_VALUES)[number],
    gender: listing.gender as (typeof GENDER_VALUES)[number],
    priceEurCents: listing.priceEurCents,
    currency: listing.currency as (typeof SUPPORTED_CURRENCIES)[number],
    boxPapers: listing.boxPapers as (typeof BOX_PAPERS_VALUES)[number] | null,
    description: listing.description,
    location: listing.location,
    photos: listing.photos.map((photo) => ({ url: photo.url })),
  };

  // Check ownership or admin
  if (listing.sellerId !== userId && role !== "ADMIN") {
    redirect("/dashboard/listings");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Izmeni Oglas</h1>
            <p className="text-muted-foreground mt-2">
              Ažurirajte informacije o oglasu
            </p>
          </div>

          <ListingWizard listing={listingForWizard} />
        </div>
      </div>
    </main>
  );
}

