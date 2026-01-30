import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = session.user.id;

  const unreadCount = await prisma.message.count({
    where: {
      thread: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      senderId: { not: userId },
      readAt: null,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex gap-6 lg:gap-8 py-8 sm:py-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <DashboardSidebar
              userName={session.user.name}
              isVerified={(session.user as any).isVerified ?? false}
              unreadCount={unreadCount}
            />
          </aside>
          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </div>
      {/* Dashboard Mobile Nav */}
      <DashboardMobileNav unreadCount={unreadCount} />
    </div>
  );
}
