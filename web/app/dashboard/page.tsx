import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/user/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ListingsPreview } from "@/app/dashboard/_components/listings-preview";
import { MessagesPreview } from "@/app/dashboard/_components/messages-preview";
import { WishlistPreview } from "@/app/dashboard/_components/wishlist-preview";
import { 
  Shield, 
  ShieldCheck, 
  FileText, 
  MessageSquare, 
  Heart, 
  User, 
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;
  const userId = user.id;

  // Optimized: Reduced from 10 queries to 9 by combining user queries
  // and using more efficient count queries
  const [
    listingStats,
    listingCount,
    unreadCount,
    wishlistCount,
    userWithVerification,
    application,
  ] = await Promise.all([
    // Listing counts by status
    prisma.listing.groupBy({
      by: ['status'],
      where: { sellerId: userId },
      _count: true
    }),
    // Total listing count (more efficient than fetching all IDs)
    prisma.listing.count({ where: { sellerId: userId } }),
    // Unread message count (more efficient single count query)
    prisma.message.count({
      where: {
        thread: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        senderId: { not: userId },
        readAt: null
      }
    }),
    // Wishlist count
    prisma.favorite.count({ where: { userId } }),
    // User verification status + profile combined (saves 1 query)
    prisma.user.findUnique({
      where: { id: userId },
      select: { 
        isVerified: true, 
        role: true,
        name: true,
        email: true,
        locationCountry: true,
        locationCity: true
      }
    }),
    // Seller application
    prisma.sellerApplication.findUnique({
      where: { userId },
      select: { status: true }
    }),
  ]);

  // Use combined user data for profile
  const userProfile = userWithVerification;
  const needsProfileCompletion = !userProfile?.locationCountry || !userProfile?.locationCity;

  // Process listing stats
  const listingCounts = {
    total: listingCount,
    approved: listingStats.find(s => s.status === 'APPROVED')?._count ?? 0,
    pending: listingStats.find(s => s.status === 'PENDING')?._count ?? 0,
    draft: listingStats.find(s => s.status === 'DRAFT')?._count ?? 0,
    rejected: listingStats.find(s => s.status === 'REJECTED')?._count ?? 0,
    archived: listingStats.find(s => s.status === 'ARCHIVED')?._count ?? 0,
    sold: listingStats.find(s => s.status === 'SOLD')?._count ?? 0,
  };

  // Use efficient unread count
  const unreadMessagesCount = unreadCount;

  const isVerified = userWithVerification?.isVerified ?? false;
  const hasApplication = !!application;
  const _userRole = userWithVerification?.role ?? 'BUYER';

  // Stat cards configuration
  type StatCard = {
    title: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    iconColor: string;
    href: string;
  };

  const statCards = [
    {
      title: "Ukupno oglasa",
      value: listingCounts.total,
      description: `${listingCounts.approved} odobreno, ${listingCounts.pending} na čekanju`,
      icon: <FileText className="h-6 w-6" aria-hidden />,
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
      href: "/dashboard/listings",
    },
    {
      title: "Nepročitane poruke",
      value: unreadMessagesCount,
      description: unreadMessagesCount === 0 ? "Nema novih poruka" : "Nove poruke za pregled",
      icon: <MessageSquare className="h-6 w-6" aria-hidden />,
      gradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
      href: "/dashboard/messages",
    },
    {
      title: "Lista želja",
      value: wishlistCount,
      description: wishlistCount === 0 ? "Nema sačuvanih oglasa" : "Sačuvani oglasi",
      icon: <Heart className="h-6 w-6" aria-hidden />,
      gradient: "from-amber-50 to-yellow-50",
      iconColor: "text-amber-600",
      href: "/dashboard/wishlist",
    },
  ] as StatCard[];

  // Add verified seller stat if verified
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
    <main className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base md:text-lg">
                  Dobrodošli, <span className="font-semibold text-foreground">{user.name || user.email}</span>!
                  {isVerified && (
                    <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold text-[#D4AF37]">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Pregled
              </TabsTrigger>
              <TabsTrigger value="listings" className="text-xs sm:text-sm">
                Oglasi
              </TabsTrigger>
              <TabsTrigger value="messages" className="text-xs sm:text-sm">
                Poruke
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="text-xs sm:text-sm">
                Lista želja
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">
                Profil
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 sm:space-y-8 mt-6">
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
              {/* Quick Stats Section */}
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Brzi pregled</h2>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Vaša aktivnost na platformi na jednom mestu
                  </p>
                </div>
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
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Status oglasa</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      Pregled oglasa po statusu
                    </p>
                  </div>
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: "Odobreno", count: listingCounts.approved, icon: CheckCircle2, color: "text-emerald-600", gradient: "from-emerald-50 to-teal-50" },
                      { label: "Na čekanju", count: listingCounts.pending, icon: Clock, color: "text-amber-600", gradient: "from-amber-50 to-yellow-50" },
                      { label: "Nacrti", count: listingCounts.draft, icon: FileText, color: "text-blue-600", gradient: "from-blue-50 to-indigo-50" },
                      { label: "Odbijeno", count: listingCounts.rejected, icon: XCircle, color: "text-red-600", gradient: "from-red-50 to-pink-50" },
                      { label: "Arhivirano", count: listingCounts.archived, icon: Archive, color: "text-gray-600", gradient: "from-gray-50 to-slate-50" },
                      { label: "Prodata", count: listingCounts.sold, icon: BarChart3, color: "text-purple-600", gradient: "from-purple-50 to-violet-50" },
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

              {/* Quick Actions Section */}
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Brze akcije</h2>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Najčešće korišćene opcije
                  </p>
                </div>
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
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-auto py-6"
                  >
                    <Link href="/dashboard/listings" className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5" aria-hidden />
                      <span>Pregled svih oglasa</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-auto py-6"
                  >
                    <Link href="/dashboard/messages" className="flex items-center justify-center gap-2">
                      <MessageSquare className="h-5 w-5" aria-hidden />
                      <span>Poruke</span>
                      {unreadMessagesCount > 0 && (
                        <span className="ml-1 rounded-full bg-[#D4AF37] px-2 py-0.5 text-xs font-semibold text-neutral-900">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-auto py-6"
                  >
                    <Link href="/dashboard/wishlist" className="flex items-center justify-center gap-2">
                      <Heart className="h-5 w-5" aria-hidden />
                      <span>Lista želja</span>
                      {wishlistCount > 0 && (
                        <span className="ml-1 rounded-full bg-[#D4AF37] px-2 py-0.5 text-xs font-semibold text-neutral-900">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-auto py-6"
                  >
                    <Link href="/dashboard/profile" className="flex items-center justify-center gap-2">
                      <User className="h-5 w-5" aria-hidden />
                      <span>Moj profil</span>
                    </Link>
                  </Button>
                  {!isVerified && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-auto py-6 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900"
                    >
                      <Link href="/sell/verified" className="flex items-center justify-center gap-2">
                        <Shield className="h-5 w-5" aria-hidden />
                        <span>{hasApplication ? "Pregled prijave" : "Prijavi prodavnicu"}</span>
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
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Moji Oglasi</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      Najnoviji oglasi
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/listings">
                        Pregled svih
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                    <Button asChild className="bg-[#D4AF37] hover:bg-[#b6932c]">
                      <Link href="/dashboard/listings/new">
                        <Plus className="mr-2 h-4 w-4" aria-hidden />
                        Novi oglas
                      </Link>
                    </Button>
                  </div>
                </div>
                <Suspense fallback={<ListingsSkeleton />}>
                  <ListingsPreview userId={userId} />
                </Suspense>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Poruke</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      Najnovije konverzacije
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/messages">
                      Pregled svih
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
                <Suspense fallback={<MessagesSkeleton />}>
                  <MessagesPreview userId={userId} />
                </Suspense>
              </div>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Lista želja</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      Sačuvani oglasi koji vam se dopadaju
                    </p>
                  </div>
                  {wishlistCount > 0 && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/wishlist">
                        Pregled svih
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  )}
                </div>
                <Suspense fallback={<WishlistSkeleton />}>
                  <WishlistPreview userId={userId} />
                </Suspense>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Moj Profil</h2>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Upravljajte svojim ličnim informacijama
                  </p>
                </div>
                {userProfile && (
                  <ProfileForm
                    initialData={{
                      name: userProfile.name,
                      email: userProfile.email,
                      locationCountry: userProfile.locationCountry,
                      locationCity: userProfile.locationCity,
                    }}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

function ListingsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
