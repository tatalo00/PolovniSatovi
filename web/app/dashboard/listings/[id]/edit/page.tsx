import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listings/listing-form";
import {
  BOX_PAPERS_VALUES,
  CONDITION_VALUES,
  SUPPORTED_CURRENCIES,
} from "@/lib/validation/listing";

type ListingFormInput = NonNullable<Parameters<typeof ListingForm>[0]["listing"]>;

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

  const listingForForm: ListingFormInput = {
    ...listing,
    condition: listing.condition as (typeof CONDITION_VALUES)[number],
    currency: listing.currency as (typeof SUPPORTED_CURRENCIES)[number],
    boxPapers: listing.boxPapers as (typeof BOX_PAPERS_VALUES)[number] | null,
    photos: listing.photos.map((photo) => ({ url: photo.url })),
  };

  // Check ownership or admin
  if (listing.sellerId !== userId && role !== "ADMIN") {
    redirect("/dashboard/listings");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Izmeni Oglas</h1>
          <p className="text-muted-foreground mt-2">
            Ažurirajte informacije o oglasu
          </p>
        </div>

        <ListingForm listing={listingForForm} />
      </div>
    </main>
  );
}

