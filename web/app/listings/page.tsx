import { prisma } from "@/lib/prisma";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingContent } from "@/components/listings/listing-content";
import { MobileFilterDrawer } from "@/components/listings/mobile-filter-drawer";
import { ListingsQuickFilterBar } from "@/components/listings/listings-quick-filter-bar";
import { auth } from "@/auth";
import type { ListingSummary } from "@/types/listing";
import { AUTHENTICATION_STATUS, type AuthenticationStatus } from "@/lib/authentication/status";
import { getListings, type IncomingSearchParams } from "@/lib/listings";

// Revalidate listings page every 5 minutes
export const revalidate = 300;

export const metadata = {
  title: "Oglasi",
  description: "Pretražite ponudu polovnih i vintage satova",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<IncomingSearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();

  const {
    listings,
    total,
    totalPages,
    popularBrands,
    currentPage,
    normalizedParams,
  } = await getListings(params);

  let favoriteIds: string[] = [];

  if (session?.user?.id) {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: { listingId: true },
      });
      favoriteIds = favorites.map((favorite) => favorite.listingId);
    } catch (error) {
      console.error("Failed to load favorites", error);
    }
  }

  const clientSearchParams: Record<string, string | undefined> = {
    brand: normalizedParams.brand?.join(","),
    model: normalizedParams.model,
    reference: normalizedParams.reference,
    min: normalizedParams.min,
    max: normalizedParams.max,
    year: normalizedParams.year,
    yearFrom: normalizedParams.yearFrom,
    yearTo: normalizedParams.yearTo,
    cond: normalizedParams.cond?.join(","),
    movement: normalizedParams.movement?.join(","),
    loc: normalizedParams.loc,
    gender: normalizedParams.gender?.join(","),
    box: normalizedParams.box?.join(","),
    verified: normalizedParams.verified,
    authenticated: normalizedParams.authenticated,
    sort: normalizedParams.sort,
  };

  if (currentPage > 1) {
    clientSearchParams.page = currentPage.toString();
  }

  if (normalizedParams.box) clientSearchParams.box = normalizedParams.box?.join(",");
  if (normalizedParams.verified) clientSearchParams.verified = normalizedParams.verified;

  const listingSummaries: ListingSummary[] = listings.map((listing) => {
    const sellerWithAuth = listing.seller as (typeof listing.seller & {
      authentication?: { status: AuthenticationStatus | null } | null;
      sellerProfile?: {
        slug: string | null;
        storeName: string | null;
        shortDescription: string | null;
        logoUrl: string | null;
      } | null;
    }) | null;

    return {
      ...listing,
      photos: listing.photos.map((photo) => ({ url: photo.url })),
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
        }
        : null,
    } satisfies ListingSummary;
  });

  const columns = 4;
  const limit = 24;

  return (
    <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:pb-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Oglasi za Satove</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Pretražite ponudu polovnih i vintage satova
        </p>
      </div>

      <ListingsQuickFilterBar brands={popularBrands} />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8 mt-4 sm:mt-6">
        <aside className="hidden lg:block">
          <ListingFilters
            popularBrands={popularBrands}
            searchParams={clientSearchParams}
          />
        </aside>

        <div className="min-w-0">
          <ListingContent
            listings={listingSummaries}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={clientSearchParams}
            columns={columns}
            perPage={limit}
            initialFavoriteIds={favoriteIds}
          />
        </div>
      </div>

      <MobileFilterDrawer
        popularBrands={popularBrands}
        searchParams={clientSearchParams}
      />
    </main>
  );
}