import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

const stripTrailing = (s: string) => s.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  const baseUrl = stripTrailing(siteConfig.url);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/*/admin/",
          "/*/dashboard/",
          "/*/login",
          "/*/register",
          "/*/forgot-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
