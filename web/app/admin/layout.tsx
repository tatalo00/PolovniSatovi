import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  // Fetch counts for badges
  const [pendingListingsCount, openReportsCount, pendingVerificationsCount] = await Promise.all([
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.sellerApplication.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex gap-6 lg:gap-8 py-8 sm:py-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <AdminSidebar
              pendingListingsCount={pendingListingsCount}
              openReportsCount={openReportsCount}
              pendingVerificationsCount={pendingVerificationsCount}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminMobileNav
        pendingListingsCount={pendingListingsCount}
        openReportsCount={openReportsCount}
        pendingVerificationsCount={pendingVerificationsCount}
      />
    </div>
  );
}
