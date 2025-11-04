import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListingQueue } from "@/components/admin/admin-listing-queue";

export const metadata = {
  title: "Oglasi za odobrenje",
  description: "Pregled i odobrenje oglasa",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const status = params.status || "PENDING";

  const listings = await prisma.listing.findMany({
    where: { status: status as any },
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

