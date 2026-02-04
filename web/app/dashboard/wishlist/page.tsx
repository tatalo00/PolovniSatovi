import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistClient } from "@/components/listings/wishlist-client";
import type { ListingSummary } from "@/types/listing";
import { AUTHENTICATION_STATUS, type AuthenticationStatus } from "@/lib/authentication/status";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
              sellerProfile: {
                select: {
                  slug: true,
                  storeName: true,
                  shortDescription: true,
                  logoUrl: true,
                  ratingAvg: true,
                  reviewCount: true,
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
          sellerProfile?: {
            slug: string | null;
            storeName: string | null;
            shortDescription: string | null;
            logoUrl: string | null;
            ratingAvg: unknown;
            reviewCount: number | null;
          } | null;
        });

      const listing = favorite.listing!;
      const currency: "EUR" | "RSD" = (listing.currency === "EUR" || listing.currency === "RSD") 
        ? listing.currency 
        : "EUR";

      return {
        ...listing,
        currency,
        favoritedAt: favorite.createdAt,
        seller: sellerWithAuth
          ? {
              name: sellerWithAuth.name,
              email: sellerWithAuth.email,
              locationCity: sellerWithAuth.locationCity,
              locationCountry: sellerWithAuth.locationCountry,
              isVerified: Boolean(sellerWithAuth.isVerified),
              isAuthenticated:
                sellerWithAuth.authentication?.status === AUTHENTICATION_STATUS.APPROVED,
              profileSlug: sellerWithAuth.sellerProfile?.slug ?? null,
              storeName: sellerWithAuth.sellerProfile?.storeName ?? null,
              shortDescription: sellerWithAuth.sellerProfile?.shortDescription ?? null,
              logoUrl: sellerWithAuth.sellerProfile?.logoUrl ?? null,
              ratingAvg: sellerWithAuth.sellerProfile?.ratingAvg
                ? Number(sellerWithAuth.sellerProfile.ratingAvg)
                : null,
              reviewCount: sellerWithAuth.sellerProfile?.reviewCount ?? null,
            }
          : null,
      } satisfies ListingSummary;
    });

  const favoriteIds = listings.map((listing) => listing.id);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Lista želja" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lista želja</h1>
        <p className="text-muted-foreground mt-2">
          Sačuvajte satove koji vam se dopadaju i pratite ih na jednom mestu.
        </p>
      </div>

      <WishlistClient
        initialListings={listings}
        initialFavoriteIds={favoriteIds}
      />
    </div>
  );
}

