import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingContent } from "@/components/listings/listing-content";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Oglasi",
  description: "Pretražite ponudu polovnih i vintage satova",
};

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
  loc?: string;
  location?: string;
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

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<IncomingSearchParams>;
}) {
  const params = await searchParams;
  const normalizedParams = normalizeSearchParams(params);

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

  let listings: any[] = [];
  let total = 0;
  let totalPages = 0;
  let popularBrands: string[] = [];

  try {
    [listings, total, popularBrands] = await Promise.all([
      prisma.listing.findMany({
        where,
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
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
        take: 12,
      }).then((rows) => rows.map((row) => row.brand)),
    ]);

    totalPages = Math.ceil(total / limit);
  } catch (error: any) {
    console.error("Database error on listings page:", error);
  }

  const clientSearchParams: Record<string, string | undefined> = {
    ...normalizedParams,
  };

  if (currentPage > 1) {
    clientSearchParams.page = currentPage.toString();
  }

  clientSearchParams.cols = columns.toString();

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
          />
        </div>
      </div>
    </main>
  );
}