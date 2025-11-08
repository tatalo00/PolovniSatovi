import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistClient } from "@/components/listings/wishlist-client";
import type { ListingSummary } from "@/types/listing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lista želja",
  description: "Sačuvani oglasi koji su vam se dopali",
};

export default async function WishlistPage() {
  const user = await requireAuth();
  const userId = (user as { id: string }).id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          photos: {
            orderBy: { order: "asc" },
            take: 1,
          },
          seller: {
            select: {
              name: true,
              email: true,
              locationCity: true,
              locationCountry: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const listings = favorites
    .filter((favorite) => favorite.listing !== null)
    .map((favorite) => ({
      ...favorite.listing!,
      favoritedAt: favorite.createdAt,
    })) as ListingSummary[];

  const favoriteIds = listings.map((listing) => listing.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Lista želja</h1>
        <p className="text-muted-foreground mt-2">
          Sačuvajte satove koji vam se dopadaju i pratite ih na jednom mestu.
        </p>
      </div>

      <WishlistClient
        initialListings={listings}
        initialFavoriteIds={favoriteIds}
      />
    </main>
  );
}

