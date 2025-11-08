import { ListingStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListingQueue } from "@/components/admin/admin-listing-queue";

export const metadata = {
  title: "Oglasi za odobrenje",
  description: "Pregled i odobrenje oglasa",
};

const LISTING_STATUSES = Object.values(ListingStatus) as string[];

function isListingStatus(value: string): value is ListingStatus {
  return LISTING_STATUSES.includes(value);
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string | string[] }>;
}) {
  await requireAdmin();

  const resolvedParams = searchParams ? await searchParams : undefined;
  const rawStatus = Array.isArray(resolvedParams?.status)
    ? resolvedParams.status[0]
    : resolvedParams?.status;
  const normalizedStatus =
    typeof rawStatus === "string" ? rawStatus.toUpperCase() : undefined;
  const status: ListingStatus = normalizedStatus && isListingStatus(normalizedStatus)
    ? normalizedStatus
    : ListingStatus.PENDING;

  const listings = await prisma.listing.findMany({
    where: { status },
    include: {
      seller: {
        select: {
          name: true,
          email: true,
          locationCity: true,
          locationCountry: true,
        },
      },
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Oglasi za odobrenje</h1>
        <p className="text-muted-foreground mt-2">
          Pregledajte i odobrite oglase
        </p>
      </div>

      <AdminListingQueue listings={listings} currentStatus={status} />
    </main>
  );
}
