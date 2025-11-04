import { prisma } from "@/lib/prisma";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingContent } from "@/components/listings/listing-content";

export const metadata = {
  title: "Oglasi",
  description: "Pretražite ponudu polovnih i vintage satova",
};

interface SearchParams {
  search?: string;
  brand?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  year?: string;
  location?: string;
  sort?: string;
  page?: string;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status: "APPROVED",
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { brand: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
      { reference: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.brand) {
    where.brand = { contains: params.brand, mode: "insensitive" };
  }

  if (params.condition) {
    where.condition = params.condition;
  }

  if (params.minPrice || params.maxPrice) {
    where.priceEurCents = {};
    if (params.minPrice) {
      where.priceEurCents.gte = parseInt(params.minPrice) * 100;
    }
    if (params.maxPrice) {
      where.priceEurCents.lte = parseInt(params.maxPrice) * 100;
    }
  }

  if (params.year) {
    where.year = parseInt(params.year);
  }

  if (params.location) {
    where.location = { contains: params.location, mode: "insensitive" };
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (params.sort) {
    switch (params.sort) {
      case "price-asc":
        orderBy = { priceEurCents: "asc" };
        break;
      case "price-desc":
        orderBy = { priceEurCents: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }
  }

  // Fetch listings and total count
  const [listings, total] = await Promise.all([
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
  ]);

  // Get unique brands for filter
  const brands = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  const totalPages = Math.ceil(total / limit);

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
            brands={brands.map((b) => b.brand)}
            searchParams={params as Record<string, string | undefined>}
          />
        </aside>

        <div className="lg:col-span-3">
          <ListingContent
            listings={listings}
            total={total}
            currentPage={page}
            totalPages={totalPages}
            searchParams={params as Record<string, string | undefined>}
          />
        </div>
      </div>
    </main>
  );
}