import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listings/listing-form";

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

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

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

        <ListingForm listing={listing} />
      </div>
    </main>
  );
}

