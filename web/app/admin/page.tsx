import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = {
  title: "Admin Panel",
  description: "Admin panel za upravljanje oglasima",
};

export default async function AdminPage() {
  await requireAdmin();

  // Get pending listings count
  const pendingCount = await prisma.listing.count({
    where: { status: "PENDING" },
  });

  const openReportsCount = await prisma.report.count({
    where: { status: "OPEN" },
  });

  const pendingVerificationsCount = await prisma.sellerApplication.count({
    where: { status: "PENDING" },
  });

  // Get recent listings for approval
  const pendingListings = await prisma.listing.findMany({
    where: { status: "PENDING" },
    include: {
      seller: {
        select: {
          name: true,
          email: true,
          sellerProfile: {
            select: {
              storeName: true,
            },
          },
        },
      },
      photos: {
        take: 1,
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  // Get recent reports
  const recentReports = await prisma.report.findMany({
    where: { status: "OPEN" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          seller: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Upravljajte oglasima i prijavama
        </p>
      </div>

      <AdminDashboard
        pendingCount={pendingCount}
        openReportsCount={openReportsCount}
        pendingVerificationsCount={pendingVerificationsCount}
        pendingListings={pendingListings}
        recentReports={recentReports}
      />
    </main>
  );
}

