import type { Listing, ListingPhoto } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { PopularBrands } from "@/components/home/popular-brands";
import { RecentListings } from "@/components/home/recent-listings";
import { Card, CardContent } from "@/components/ui/card";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

type ListingWithPhoto = Listing & { photos: ListingPhoto[] };
type BrandResult = { brand: string | null };

export default async function HomePage() {
  // Fetch data with error handling
  let recentListings: ListingWithPhoto[] = [];
  let brands: BrandResult[] = [];
  let totalListings = 0;
  let totalSellers = 0;

  try {
    recentListings = await prisma.listing.findMany({
      where: { status: "APPROVED" },
      include: {
        photos: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    brands = await prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    [totalListings, totalSellers] = await Promise.all([
      prisma.listing.count({
        where: { status: "APPROVED" },
      }),
      prisma.user.count({
        where: {
          listings: {
            some: {
              status: "APPROVED",
            },
          },
        },
      }),
    ]);
  } catch (error: unknown) {
    console.error("Database error on homepage:", error);
    // Continue with empty data - page will still render
  }

  const brandCounts = new Map<string, number>();
  for (const listing of recentListings) {
    if (!listing.brand) continue;
    const key = listing.brand.trim();
    brandCounts.set(key, (brandCounts.get(key) ?? 0) + 1);
  }

  const topBrands = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return (
    <main>
      <Hero />
      <RecentListings listings={recentListings} />
      <PopularBrands highlight={topBrands} />

      {/* Statistics Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalListings}
                </div>
                <div className="text-muted-foreground">Aktivnih Oglasa</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalSellers}
                </div>
                <div className="text-muted-foreground">Prodavaca</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {brands.length}
                </div>
                <div className="text-muted-foreground">Različitih Marki</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
