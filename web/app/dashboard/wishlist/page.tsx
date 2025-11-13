import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistClient } from "@/components/listings/wishlist-client";
import type { ListingSummary } from "@/types/listing";
import { AUTHENTICATION_STATUS, type AuthenticationStatus } from "@/lib/authentication/status";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lista želja",
  description: "Sačuvani oglasi koji su vam se dopali",
};

export default async function WishlistPage() {
  const user = await requireAuth();
  const userId = (user as { id: string }).id;

  const favorites = (await prisma.favorite.findMany({
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
              isVerified: true,
              authentication: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as Array<
    Prisma.FavoriteGetPayload<{
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: "asc" };
              take: 1;
            };
            seller: {
              select: {
                name: true;
                email: true;
                locationCity: true;
                locationCountry: true;
                isVerified: true;
                authentication: {
                  select: {
                    status: true;
                  };
                };
              };
            };
          };
        };
      };
    }>
  >;

  const listings = favorites
    .filter((favorite) => favorite.listing !== null)
    .map((favorite) => {
      const sellerEntity = favorite.listing?.seller;
      const sellerWithAuth =
        sellerEntity &&
        (sellerEntity as typeof sellerEntity & {
          authentication?: { status: AuthenticationStatus | null } | null;
        });

      return {
        ...favorite.listing!,
        favoritedAt: favorite.createdAt,
        seller: sellerWithAuth
          ? {
              name: sellerWithAuth.name,
              email: sellerWithAuth.email,
              locationCity: sellerWithAuth.locationCity,
              locationCountry: sellerWithAuth.locationCountry,
              isVerified: sellerWithAuth.isVerified,
              isAuthenticated:
                sellerWithAuth.authentication?.status === AUTHENTICATION_STATUS.APPROVED,
            }
          : null,
      } satisfies ListingSummary;
    });

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

