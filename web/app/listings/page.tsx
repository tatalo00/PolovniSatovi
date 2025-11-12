import { Prisma, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingContent } from "@/components/listings/listing-content";
import { auth } from "@/auth";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Oglasi",
  description: "Pretražite ponudu polovnih i vintage satova",
};

type ListingWithSeller = Prisma.ListingGetPayload<{
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
      };
    };
  };
}>;

interface IncomingSearchParams {
  q?: string;
  search?: string;
  brand?: string;
  model?: string;
  min?: string;
  minPrice?: string;
  max?: string;
  maxPrice?: string;
  year?: string;
  cond?: string;
  condition?: string;
  movement?: string;
  loc?: string;
  location?: string;
  gender?: string;
  box?: string;
  verified?: string;
  sort?: string;
  cols?: string;
  page?: string;
}

type NormalizedParams = Record<string, string>;

const normalizeSearchParams = (params: IncomingSearchParams): NormalizedParams => {
  const normalized: NormalizedParams = {};

  const q = params.q ?? params.search;
  if (q && q.trim().length > 0) {
    normalized.q = q.trim();
  }

  if (params.brand && params.brand.trim().length > 0) {
    normalized.brand = params.brand.trim();
  }

  if (params.model && params.model.trim().length > 0) {
    normalized.model = params.model.trim();
  }

  if (params.movement && params.movement.trim().length > 0) {
    normalized.movement = params.movement.trim();
  }

  const min = params.min ?? params.minPrice;
  if (min && min.trim().length > 0) {
    normalized.min = min.trim();
  }

  const max = params.max ?? params.maxPrice;
  if (max && max.trim().length > 0) {
    normalized.max = max.trim();
  }

  if (params.year && params.year.trim().length > 0) {
    normalized.year = params.year.trim();
  }

  if (params.gender && params.gender.trim().length > 0) {
    normalized.gender = params.gender.trim();
  }

  if (params.box && params.box.trim().length > 0) {
    normalized.box = params.box.trim();
  }

  if (params.verified && params.verified.trim().length > 0) {
    normalized.verified = params.verified.trim();
  }

  const cond = params.cond ?? params.condition;
  if (cond && cond.trim().length > 0) {
    normalized.cond = cond.trim();
  }

  const loc = params.loc ?? params.location;
  if (loc && loc.trim().length > 0) {
    normalized.loc = loc.trim();
  }

  if (params.sort && params.sort.trim().length > 0) {
    normalized.sort = params.sort.trim();
  }

  if (params.cols && ["3", "4", "5"].includes(params.cols.trim())) {
    normalized.cols = params.cols.trim();
  }

  if (params.page && params.page.trim().length > 0) {
    normalized.page = params.page.trim();
  }

  return normalized;
};

const buildWhereClause = (filters: NormalizedParams): Prisma.ListingWhereInput => {
  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { model: { contains: filters.q, mode: "insensitive" } },
      { reference: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.brand) {
    where.brand = { contains: filters.brand, mode: "insensitive" };
  }

  if (filters.model) {
    where.model = { contains: filters.model, mode: "insensitive" };
  }

  if (filters.movement) {
    where.movement = { contains: filters.movement, mode: "insensitive" };
  }

  if (filters.cond) {
    where.condition = filters.cond;
  }

  if (filters.min || filters.max) {
    where.priceEurCents = {};

    if (filters.min) {
      const minValue = parseInt(filters.min, 10);
      if (!Number.isNaN(minValue)) {
        where.priceEurCents.gte = minValue * 100;
      }
    }

    if (filters.max) {
      const maxValue = parseInt(filters.max, 10);
      if (!Number.isNaN(maxValue)) {
        where.priceEurCents.lte = maxValue * 100;
      }
    }
  }

  if (filters.year) {
    const yearValue = parseInt(filters.year, 10);
    if (!Number.isNaN(yearValue)) {
      where.year = yearValue;
    }
  }

  if (filters.loc) {
    const existingAnd = Array.isArray(where.AND)
      ? where.AND
      : where.AND
      ? [where.AND]
      : [];
    where.AND = [
      ...existingAnd,
      {
        OR: [
          { location: { contains: filters.loc, mode: "insensitive" } },
          { seller: { locationCity: { contains: filters.loc, mode: "insensitive" } } },
          { seller: { locationCountry: { contains: filters.loc, mode: "insensitive" } } },
        ],
      },
    ];
  }

  if (filters.gender) {
    const normalizedGender = filters.gender.trim().toUpperCase();
    if (normalizedGender === Gender.MALE || normalizedGender === Gender.FEMALE) {
      where.gender = { in: [normalizedGender as Gender, Gender.UNISEX] };
    } else if (normalizedGender === Gender.UNISEX) {
      where.gender = normalizedGender as Gender;
    }
  }

  if (filters.box) {
    const normalizedBox = filters.box.trim().toLowerCase();
    if (normalizedBox === "full") {
      where.boxPapers = { not: null };
    }
  }

  if (filters.verified) {
    const normalizedVerified = filters.verified.trim().toLowerCase();
    if (["1", "true", "yes"].includes(normalizedVerified)) {
      const existingAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
        ? [where.AND]
        : [];
      where.AND = [
        ...existingAnd,
        {
          seller: {
            isVerified: true,
          },
        },
      ];
    }
  }

  return where;
};

const resolveOrderBy = (
  sort?: string
): Prisma.ListingOrderByWithRelationInput | Prisma.ListingOrderByWithRelationInput[] => {
  switch (sort) {
    case "price-asc":
      return { priceEurCents: "asc" };
    case "price-desc":
      return { priceEurCents: "desc" };
    case "year-desc":
      return [
        { year: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ];
    case "year-asc":
      return [
        { year: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ];
    case "oldest":
      return { createdAt: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

const cloneWhereInput = (input: Prisma.ListingWhereInput): Prisma.ListingWhereInput =>
  JSON.parse(JSON.stringify(input));

const removeVerifiedFilter = (
  whereInput: Prisma.ListingWhereInput
): Prisma.ListingWhereInput => {
  const clone = cloneWhereInput(whereInput);
  if (!clone.AND) {
    return clone;
  }
  const andArray = Array.isArray(clone.AND) ? clone.AND : [clone.AND];
  const filtered = andArray
    .map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const entryObj = entry as Record<string, unknown>;
      const sellerValue = entryObj.seller as Record<string, unknown> | undefined;
      if (sellerValue && typeof sellerValue === "object" && "isVerified" in sellerValue) {
        const { seller, ...rest } = entryObj;
        if (Object.keys(rest).length === 0) {
          return null;
        }
        return rest as Prisma.ListingWhereInput;
      }
      return entry;
    })
    .filter(Boolean) as Prisma.ListingWhereInput[];

  if (filtered.length === 0) {
    delete clone.AND;
  } else {
    clone.AND = filtered;
  }
  return clone;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<IncomingSearchParams>;
}) {
  const params = await searchParams;
  const normalizedParams = normalizeSearchParams(params);
  const session = await auth();

  const columns = (() => {
    const parsed = parseInt(normalizedParams.cols ?? "3", 10);
    if ([3, 4, 5].includes(parsed)) {
      return parsed;
    }
    return 3;
  })();

  const page = parseInt(normalizedParams.page ?? "1", 10);
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const limit = columns === 5 ? 25 : 24;
  const offset = (currentPage - 1) * limit;

  const where = buildWhereClause(normalizedParams);
  const orderBy = resolveOrderBy(normalizedParams.sort);

  const runQueries = async (whereInput: Prisma.ListingWhereInput) => {
    const [listingsResult, totalResult, popularBrandsResult] = await Promise.all([
      prisma.listing.findMany({
        where: whereInput,
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
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.listing.count({ where: whereInput }),
      prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
        take: 12,
      }).then((rows) => rows.map((row) => row.brand)),
    ]);
    return { listingsResult, totalResult, popularBrandsResult };
  };

  let listings: ListingWithSeller[] = [];
  let total = 0;
  let totalPages = 0;
  let popularBrands: string[] = [];
  let favoriteIds: string[] = [];

  try {
    const { listingsResult, totalResult, popularBrandsResult } = await runQueries(where);
    listings = listingsResult;
    total = totalResult;
    popularBrands = popularBrandsResult;
    totalPages = Math.ceil(total / limit);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2022"
    ) {
      const fallbackWhere = removeVerifiedFilter(where);
      const { listingsResult, totalResult, popularBrandsResult } = await runQueries(
        fallbackWhere
      );
      listings = listingsResult;
      total = totalResult;
      popularBrands = popularBrandsResult;
      totalPages = Math.ceil(total / limit);
    } else {
      throw error;
    }
  }

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
    ...normalizedParams,
  };

  if (currentPage > 1) {
    clientSearchParams.page = currentPage.toString();
  }

  clientSearchParams.cols = columns.toString();
  if (normalizedParams.box) clientSearchParams.box = normalizedParams.box;
  if (normalizedParams.verified) clientSearchParams.verified = normalizedParams.verified;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Oglasi za Satove</h1>
        <p className="text-muted-foreground mt-2">
          Pretražite ponudu polovnih i vintage satova
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ListingFilters
            popularBrands={popularBrands}
            searchParams={clientSearchParams}
          />
        </aside>

        <div className="lg:col-span-3">
          <ListingContent
            listings={listings}
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
    </main>
  );
}