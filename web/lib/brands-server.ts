import "server-only";

import { Gender } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type TopBrandsByGender = {
  men: string[];
  women: string[];
};

const GENDER_SCOPES: Record<"men" | "women", Gender[]> = {
  men: [Gender.MALE, Gender.UNISEX],
  women: [Gender.FEMALE, Gender.UNISEX],
};

export async function getTopBrandsByGender(limit = 10): Promise<TopBrandsByGender> {
  const entries = await Promise.all(
    (Object.keys(GENDER_SCOPES) as Array<keyof typeof GENDER_SCOPES>).map(async (key) => {
      const result = await prisma.listing.groupBy({
        by: ["brand"],
        _count: { _all: true },
        where: {
          status: "APPROVED",
          gender: { in: GENDER_SCOPES[key] },
        },
        orderBy: {
          _count: {
            brand: "desc",
          },
        },
        take: limit,
      });

      return [key, result.map((entry) => entry.brand)] as const;
    })
  );

  return entries.reduce<TopBrandsByGender>(
    (acc, [key, brands]) => {
      acc[key] = brands;
      return acc;
    },
    { men: [], women: [] }
  );
}


