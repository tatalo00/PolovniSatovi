import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminReportsList } from "@/components/admin/admin-reports-list";

export const metadata = {
  title: "Prijave",
  description: "Pregled prijava oglasa",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

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
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Prijave</h1>
        <p className="text-muted-foreground mt-2">
          Pregledajte prijave oglasa
        </p>
      </div>

      <AdminReportsList reports={reports} currentStatus={status} />
    </main>
  );
}

