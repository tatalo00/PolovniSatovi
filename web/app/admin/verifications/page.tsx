import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerApplicationStatus } from "@prisma/client";
import { AdminVerificationsList } from "@/components/admin/admin-verifications-list";

export const metadata = {
  title: "Verified Prodavci - Prijave",
  description: "Pregled i odobrenje prijava za verified prodavce",
};

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const statusParam = params.status?.toUpperCase();
  const status: SellerApplicationStatus =
    statusParam && Object.values(SellerApplicationStatus).includes(statusParam as SellerApplicationStatus)
      ? (statusParam as SellerApplicationStatus)
      : SellerApplicationStatus.PENDING;

  const applications = await prisma.sellerApplication.findMany({
    where: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          locationCity: true,
          locationCountry: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await Promise.all([
    prisma.sellerApplication.count({
      where: { status: SellerApplicationStatus.PENDING },
    }),
    prisma.sellerApplication.count({
      where: { status: SellerApplicationStatus.APPROVED },
    }),
    prisma.sellerApplication.count({
      where: { status: SellerApplicationStatus.REJECTED },
    }),
  ]);

  const [pendingCount, approvedCount, rejectedCount] = counts;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Verified Prodavci - Prijave</h1>
        <p className="text-muted-foreground mt-2">
          Pregledajte i odobrite prijave za verified prodavce
        </p>
      </div>

      <AdminVerificationsList
        applications={applications.map(app => ({
          ...app,
          status: app.status as "PENDING" | "APPROVED" | "REJECTED"
        })) as any}
        currentStatus={status as any}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
      />
    </main>
  );
}

