import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { FeaturedListings } from "@/components/home/featured-listings";
import { Categories } from "@/components/home/categories";
import { Card, CardContent } from "@/components/ui/card";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch featured listings (recent approved listings)
  const featuredListings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    include: {
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
      seller: {
        select: {
          name: true,
          locationCity: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Get unique brands for categories
  const brands = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  // Get statistics
  const [totalListings, totalSellers] = await Promise.all([
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

  return (
    <main>
      <Hero />

      {featuredListings.length > 0 && (
        <FeaturedListings listings={featuredListings} />
      )}

      {brands.length > 0 && (
        <Categories brands={brands.map((b) => b.brand)} />
      )}

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
