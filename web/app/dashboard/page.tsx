import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SavedSearchesPreview } from "@/app/dashboard/_components/saved-searches-preview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ActivityFeedSkeleton } from "@/components/dashboard/activity-feed-skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Shield,
  ShieldCheck,
  FileText,
  MessageSquare,
  Heart,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  BarChart3,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;
  const userId = user.id;

  const [
    listingStats,
    listingCount,
    unreadCount,
    wishlistCount,
    userWithVerification,
    application,
  ] = await Promise.all([
    prisma.listing.groupBy({
      by: ['status'],
      where: { sellerId: userId },
      _count: true,
    }),
    prisma.listing.count({ where: { sellerId: userId } }),
    prisma.message.count({
      where: {
        thread: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        senderId: { not: userId },
        readAt: null,
      },
    }),
    prisma.favorite.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        isVerified: true,
        role: true,
        name: true,
        email: true,
        locationCountry: true,
        locationCity: true,
      },
    }),
    prisma.sellerApplication.findUnique({
      where: { userId },
      select: { status: true },
    }),
  ]);

  const userProfile = userWithVerification;
  const needsProfileCompletion = !userProfile?.locationCountry || !userProfile?.locationCity;

  const listingCounts = {
    total: listingCount,
    approved: listingStats.find(s => s.status === 'APPROVED')?._count ?? 0,
    pending: listingStats.find(s => s.status === 'PENDING')?._count ?? 0,
    draft: listingStats.find(s => s.status === 'DRAFT')?._count ?? 0,
    rejected: listingStats.find(s => s.status === 'REJECTED')?._count ?? 0,
    archived: listingStats.find(s => s.status === 'ARCHIVED')?._count ?? 0,
    sold: listingStats.find(s => s.status === 'SOLD')?._count ?? 0,
  };

  const unreadMessagesCount = unreadCount;
  const isVerified = userWithVerification?.isVerified ?? false;
  const hasApplication = !!application;

  type StatCard = {
    title: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    iconColor: string;
    href: string;
  };

  const statCards: StatCard[] = [
    {
      title: "Moji oglasi",
      value: listingCounts.total,
      description: listingCounts.total === 0
        ? "Kreirajte vaš prvi oglas"
        : listingCounts.pending > 0
          ? `${listingCounts.approved} aktivno · ${listingCounts.pending} čeka odobrenje`
          : `${listingCounts.approved} aktivno`,
      icon: <FileText className="h-6 w-6" aria-hidden />,
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
      href: "/dashboard/listings",
    },
    {
      title: "Poruke",
      value: unreadMessagesCount,
      description: unreadMessagesCount === 0
        ? "Nema novih poruka"
        : `${unreadMessagesCount} ${unreadMessagesCount === 1 ? "novo pitanje" : "nova pitanja"} — odgovorite danas`,
      icon: <MessageSquare className="h-6 w-6" aria-hidden />,
      gradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
      href: "/dashboard/messages",
    },
    {
      title: "Lista želja",
      value: wishlistCount,
      description: wishlistCount === 0
        ? "Sačuvajte oglase koji vam se dopadaju"
        : `${wishlistCount} sačuvanih oglasa`,
      icon: <Heart className="h-6 w-6" aria-hidden />,
      gradient: "from-amber-50 to-yellow-50",
      iconColor: "text-amber-600",
      href: "/dashboard/wishlist",
    },
  ];

  if (isVerified) {
    statCards.push({
      title: "Verified Prodavac",
      value: "Aktivan" as number | string,
      description: "Vaš verified status je aktivan",
      icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
      gradient: "from-[#D4AF37]/15 to-amber-50/30",
      iconColor: "text-[#D4AF37]",
      href: "/dashboard/seller/profile",
    });
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Dobrodošli, {user.name?.split(" ")[0] || "nazad"}!
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Evo šta se dešava na vašem nalogu
          {isVerified && (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold text-[#D4AF37]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Verified
            </span>
          )}
        </p>
      </div>

      {/* Profile Completion Alert */}
      {needsProfileCompletion && (
        <Card className="border-[#D4AF37]/40 bg-[#D4AF37]/5">
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Dopunite profil
              </h3>
              <p className="text-sm text-muted-foreground">
                Dodajte državu i grad kako bismo bolje prilagodili iskustvo.
              </p>
            </div>
            <Button asChild className="bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900">
              <Link href="/dashboard/profile">Dopuni profil</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Brzi pregled</h2>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className={cn(
                "group relative overflow-hidden border-2 border-border/60 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
                "hover:border-[#D4AF37]/40"
              )}>
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                  stat.gradient
                )} />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("flex-shrink-0", stat.iconColor)}>
                      {stat.icon}
                    </div>
                    {typeof stat.value === 'number' && (
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">
                        {stat.value}
                      </span>
                    )}
                    {typeof stat.value === 'string' && (
                      <span className="text-sm font-semibold text-foreground">
                        {stat.value}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-lg">{stat.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {stat.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Listing Status Breakdown */}
      {listingCounts.total > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Status oglasa</h2>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Odobreno", count: listingCounts.approved, icon: CheckCircle2, color: "text-emerald-600", gradient: "from-emerald-50 to-teal-50" },
              { label: "Na čekanju", count: listingCounts.pending, icon: Clock, color: "text-amber-600", gradient: "from-amber-50 to-yellow-50" },
              { label: "Nacrti", count: listingCounts.draft, icon: FileText, color: "text-blue-600", gradient: "from-blue-50 to-indigo-50" },
              { label: "Odbijeno", count: listingCounts.rejected, icon: XCircle, color: "text-red-600", gradient: "from-red-50 to-pink-50" },
              { label: "Arhivirano", count: listingCounts.archived, icon: Archive, color: "text-gray-600", gradient: "from-gray-50 to-slate-50" },
              { label: "Prodato", count: listingCounts.sold, icon: BarChart3, color: "text-purple-600", gradient: "from-purple-50 to-violet-50" },
            ].filter(item => item.count > 0).map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className={cn(
                  "group relative overflow-hidden border-2 border-border/60 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-md",
                  "hover:border-[#D4AF37]/40"
                )}>
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                    item.gradient
                  )} />
                  <CardContent className="relative z-10 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", item.color)} aria-hidden />
                        <span className="text-sm sm:text-base font-medium text-foreground">{item.label}</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-foreground">{item.count}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Contextual Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Brze akcije</h2>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            asChild
            size="lg"
            className="h-auto py-6 bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900 font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/dashboard/listings/new" className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" aria-hidden />
              <span>Kreiraj novi oglas</span>
            </Link>
          </Button>
          {unreadMessagesCount > 0 && (
            <Button asChild variant="outline" size="lg" className="h-auto py-6">
              <Link href="/dashboard/messages" className="flex items-center justify-center gap-2">
                <MessageSquare className="h-5 w-5" aria-hidden />
                <span>Odgovorite na {unreadMessagesCount} {unreadMessagesCount === 1 ? "poruku" : "poruke"}</span>
              </Link>
            </Button>
          )}
          {listingCounts.pending > 0 && (
            <Button asChild variant="outline" size="lg" className="h-auto py-6">
              <Link href="/dashboard/listings" className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" aria-hidden />
                <span>{listingCounts.pending} {listingCounts.pending === 1 ? "oglas čeka" : "oglasa čekaju"} odobrenje</span>
              </Link>
            </Button>
          )}
          {!isVerified && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900"
            >
              <Link href="/sell/verified" className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" aria-hidden />
                <span>{hasApplication ? "Pregled prijave" : "Postanite verifikovani"}</span>
              </Link>
            </Button>
          )}
          {isVerified && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900"
            >
              <Link href="/dashboard/seller/profile" className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <span>Upravljaj prodavačkim profilom</span>
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Activity Feed */}
      <section className="space-y-4">
        <Suspense fallback={<ActivityFeedSkeleton />}>
          <ActivityFeed userId={userId} />
        </Suspense>
      </section>

      {/* Saved Searches */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[#D4AF37]" aria-hidden />
            Sačuvane pretrage
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Brz pristup vašim omiljenim filterima
          </p>
        </div>
        <SavedSearchesPreview userId={userId} />
      </section>
    </div>
  );
}
