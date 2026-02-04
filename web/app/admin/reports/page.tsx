import { prisma } from "@/lib/prisma";
import { AdminReportsList } from "@/components/admin/admin-reports-list";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = {
  title: "Prijave",
  description: "Pregled prijava oglasa",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "OPEN";

  const reports = await prisma.report.findMany({
    where: { status: status as any },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
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
  });

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Admin Panel", href: "/admin" },
          { label: "Prijave" },
        ]}
        className="mb-4"
      />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Prijave</h1>
        <p className="text-muted-foreground mt-2">
          Pregledajte prijave oglasa
        </p>
      </div>

      <AdminReportsList reports={reports} currentStatus={status} />
    </>
  );
}

