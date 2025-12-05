import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

const BASE_URL = "https://www.polovnisatovi.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Get all active listings
  const listings = await prisma.listing.findMany({
    where: { status: ListingStatus.APPROVED },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${BASE_URL}/listing/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Get all seller profiles with slugs
  const sellers = await prisma.sellerProfile.findMany({
    select: {
      slug: true,
    },
    where: {
      slug: { not: null },
    },
  });

  const sellerPages: MetadataRoute.Sitemap = sellers
    .filter((seller) => seller.slug)
    .map((seller) => ({
      url: `${BASE_URL}/sellers/${seller.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticPages, ...listingPages, ...sellerPages];
}
