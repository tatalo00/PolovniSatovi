import { Prisma, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { AUTHENTICATION_STATUS } from "@/lib/authentication/status";

export type ListingWithSeller = Prisma.ListingGetPayload<{
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
}>;

export interface IncomingSearchParams {
  brand?: string | string[];
  model?: string | string[];
  reference?: string | string[];
  min?: string | string[];
  minPrice?: string | string[];
  max?: string | string[];
  maxPrice?: string | string[];
  year?: string | string[];
  yearFrom?: string | string[];
  yearTo?: string | string[];
  cond?: string | string[];
  condition?: string | string[];
  movement?: string | string[];
  loc?: string | string[];
  location?: string | string[];
  gender?: string | string[];
  box?: string | string[];
  verified?: string | string[];
  authenticated?: string | string[];
  sort?: string | string[];
  page?: string | string[];
  [key: string]: string | string[] | undefined;
}

export type NormalizedParams = {
  brand?: string[];
  model?: string;
  reference?: string;
  movement?: string[];
  min?: string;
  max?: string;
  year?: string;
  yearFrom?: string;
  yearTo?: string;
  gender?: string[];
  box?: string[];
  verified?: string;
  authenticated?: string;
  cond?: string[];
  loc?: string;
  sort?: string;
  page?: string;
};

const parseMultiParam = (value?: string | string[]): string[] => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(",");
  return raw
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
};

const getFirstValue = (value?: string | string[]): string | undefined => {
  if (!value) return undefined;
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return undefined;
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const normalizeSearchParams = (params: IncomingSearchParams): NormalizedParams => {
  const normalized: NormalizedParams = {};

  const brands = parseMultiParam(params.brand);
  if (brands.length) {
    normalized.brand = brands;
  }

  const model = getFirstValue(params.model);
  if (model) {
    normalized.model = model;
  }

  const reference = getFirstValue(params.reference);
  if (reference) {
    normalized.reference = reference;
  }

  const movements = parseMultiParam(params.movement);
  if (movements.length) {
    normalized.movement = movements;
  }

  const min = getFirstValue(params.min ?? params.minPrice);
  if (min) {
    normalized.min = min;
  }

  const max = getFirstValue(params.max ?? params.maxPrice);
  if (max) {
    normalized.max = max;
  }

  const year = getFirstValue(params.year);
  if (year) {
    normalized.year = year;
  }

  const yearFrom = getFirstValue(params.yearFrom);
  if (yearFrom) {
    normalized.yearFrom = yearFrom;
  }

  const yearTo = getFirstValue(params.yearTo);
  if (yearTo) {
    normalized.yearTo = yearTo;
  }

  const conditions = parseMultiParam(params.cond ?? params.condition);
  if (conditions.length) {
    normalized.cond = conditions;
  }

  const gender = parseMultiParam(params.gender);
  if (gender.length) {
    normalized.gender = gender;
  }

  const box = parseMultiParam(params.box);
  if (box.length) {
    normalized.box = box;
  }

  const verified = getFirstValue(params.verified);
  if (verified) {
    normalized.verified = verified;
  }

  const authenticated = getFirstValue(params.authenticated);
  if (authenticated) {
    normalized.authenticated = authenticated;
  }

  const loc = getFirstValue(params.loc ?? params.location);
  if (loc) {
    normalized.loc = loc;
  }

  const sort = getFirstValue(params.sort);
  if (sort) {
    normalized.sort = sort;
  }

  const page = getFirstValue(params.page);
  if (page) {
    normalized.page = page;
  }

  return normalized;
};

export const buildWhereClause = (filters: NormalizedParams): Prisma.ListingWhereInput => {
  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
  };

  const appendAndCondition = (condition: Prisma.ListingWhereInput) => {
    const existingAnd = Array.isArray(where.AND)
      ? where.AND
      : where.AND
      ? [where.AND]
      : [];
    where.AND = [...existingAnd, condition];
  };

  if (filters.brand?.length) {
    const brandConditions = filters.brand.map((value) => ({
      brand: { contains: value, mode: "insensitive" as const },
    }));
    appendAndCondition({ OR: brandConditions });
  }

  if (filters.model) {
    appendAndCondition({ model: { contains: filters.model, mode: "insensitive" } });
  }

  if (filters.reference) {
    appendAndCondition({ reference: { contains: filters.reference, mode: "insensitive" } });
  }

  if (filters.movement?.length) {
    appendAndCondition({ movement: { in: filters.movement } });
  }

  if (filters.cond?.length) {
    appendAndCondition({ condition: { in: filters.cond } });
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
  } else {
    const yearRange: Prisma.IntFilter = {};
    if (filters.yearFrom) {
      const minYear = parseInt(filters.yearFrom, 10);
      if (!Number.isNaN(minYear)) {
        yearRange.gte = minYear;
      }
    }
    if (filters.yearTo) {
      const maxYear = parseInt(filters.yearTo, 10);
      if (!Number.isNaN(maxYear)) {
        yearRange.lte = maxYear;
      }
    }
    if (Object.keys(yearRange).length > 0) {
      where.year = yearRange;
    }
  }

  if (filters.loc) {
    appendAndCondition({
      OR: [
        { location: { contains: filters.loc, mode: "insensitive" } },
        { seller: { locationCity: { contains: filters.loc, mode: "insensitive" } } },
        { seller: { locationCountry: { contains: filters.loc, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.gender?.length) {
    const genderValues = filters.gender
      .map((value) => value.toUpperCase())
      .filter((value) => ["MALE", "FEMALE", "UNISEX"].includes(value)) as Gender[];
    if (genderValues.length) {
      appendAndCondition({ gender: { in: genderValues } });
    }
  }

  if (filters.box?.length) {
    if (filters.box.length) {
      const extrasConditions: Prisma.ListingWhereInput[] = [];
      filters.box.forEach((value) => {
        switch (value) {
          case "BOX":
            extrasConditions.push({
              boxPapers: { contains: "box", mode: "insensitive" },
            });
            break;
          case "PAPERS":
            extrasConditions.push({
              boxPapers: { contains: "pap", mode: "insensitive" },
            });
            break;
          case "BOTH":
            extrasConditions.push({
              AND: [
                { boxPapers: { contains: "box", mode: "insensitive" } },
                { boxPapers: { contains: "pap", mode: "insensitive" } },
              ],
            });
            break;
          case "NONE":
            extrasConditions.push({ boxPapers: null });
            extrasConditions.push({ boxPapers: "" });
            break;
          default:
            break;
        }
      });
      if (extrasConditions.length) {
        appendAndCondition({ OR: extrasConditions });
      }
    }
  }

  if (filters.verified) {
    appendAndCondition({
      seller: {
        isVerified: true,
      },
    });
  }

  if (filters.authenticated) {
    appendAndCondition({
      seller: {
        authentication: {
          status: AUTHENTICATION_STATUS.APPROVED,
        },
      },
    } as Prisma.ListingWhereInput);
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
      return { createdAt: "desc" };
    case "relevance":
      return [
        { seller: { isVerified: "desc" } },
        { createdAt: "desc" },
      ];
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
        const rest = { ...entryObj };
        delete rest.seller;
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

async function fetchListingsData(params: IncomingSearchParams) {
  const normalizedParams = normalizeSearchParams(params);
  const page = parseInt(normalizedParams.page ?? "1", 10);
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const limit = 24;
  const offset = (currentPage - 1) * limit;

  const where = buildWhereClause(normalizedParams);
  const orderBy = resolveOrderBy(normalizedParams.sort);

  const runQueries = async (whereInput: Prisma.ListingWhereInput) => {
    const listingQueryArgs = {
      where: whereInput,
      relationLoadStrategy: "join" as const,
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
      orderBy,
      take: limit,
      skip: offset,
    } as unknown as Prisma.ListingFindManyArgs;

    const [listingsResult, totalResult, popularBrandsResult] = await Promise.all([
      prisma.listing.findMany(listingQueryArgs),
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

  try {
    const { listingsResult, totalResult, popularBrandsResult } = await runQueries(where);
    listings = listingsResult as ListingWithSeller[];
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
      listings = listingsResult as ListingWithSeller[];
      total = totalResult;
      popularBrands = popularBrandsResult;
      totalPages = Math.ceil(total / limit);
    } else {
      throw error;
    }
  }

  return {
    listings,
    total,
    totalPages,
    popularBrands,
    currentPage,
    normalizedParams,
  };
}

export const getListings = unstable_cache(
  fetchListingsData,
  ["listings-page-data"],
  {
    tags: [CACHE_TAGS.listings],
    revalidate: REVALIDATE.MEDIUM,
  }
);
