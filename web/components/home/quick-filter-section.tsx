import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { QuickFilterBar } from "./quick-filter-bar";

async function getBrands() {
  "use cache";
  cacheLife("days");
  cacheTag("listings");

  const distinctBrands = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    distinct: ["brand"],
    select: { brand: true },
  });

  return distinctBrands
    .map((entry) => entry.brand)
    .filter((brandName): brandName is string => Boolean(brandName));
}

export async function QuickFilterSection() {
  let availableBrands: string[] = [];

  try {
    availableBrands = await getBrands();
  } catch (error) {
    console.error("Database error fetching brands:", error);
  }

  return <QuickFilterBar brands={availableBrands} />;
}
