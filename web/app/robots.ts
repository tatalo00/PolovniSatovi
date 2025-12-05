import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.polovnisatovi.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/sell/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
