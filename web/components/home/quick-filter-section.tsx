import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { QuickFilterBar } from "./quick-filter-bar";

const getBrands = unstable_cache(
  async () => {
    const distinctBrands = await prisma.listing.findMany({
      where: {
        status: "APPROVED",
      },
      distinct: ["brand"],
      select: { brand: true },
    });

    return distinctBrands
      .map((entry) => entry.brand)
      .filter((brandName): brandName is string => Boolean(brandName));
  },
  ["quick-filter-brands"],
  {
    tags: [CACHE_TAGS.listings],
    revalidate: REVALIDATE.MEDIUM,
  }
);

export async function QuickFilterSection() {
  let availableBrands: string[] = [];

  try {
    availableBrands = await getBrands();
  } catch (error) {
    console.error("Database error fetching brands:", error);
  }

  return <QuickFilterBar brands={availableBrands} />;
}
