import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

// Cache the sitemap for 1 hour. Prisma queries here only need to refresh
// when locations are added/removed — once an hour is plenty.
export const revalidate = 3600;

const LOCALES = ["id", "en"] as const;
type Locale = (typeof LOCALES)[number];

const stripTrailing = (s: string) => s.replace(/\/+$/, "");

/**
 * Static public routes paired with priority + change frequency.
 * Auth pages are intentionally excluded — they are noindex.
 */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/locations", priority: 0.8, changeFrequency: "weekly" },
  { path: "/promo", priority: 0.8, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = stripTrailing(siteConfig.url);
  const now = new Date();

  // Static + locale combinations.
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    LOCALES.map((locale: Locale) => ({
      url: `${baseUrl}/${locale}${route.path === "/" ? "" : route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [
            l,
            `${baseUrl}/${l}${route.path === "/" ? "" : route.path}`,
          ])
        ),
      },
    }))
  );

  // Dynamic location/booking pages — best-effort. If DB is unreachable
  // during build (e.g. preview env), fall back gracefully to static-only
  // sitemap so the build doesn't fail.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    });

    dynamicEntries = locations.flatMap((loc) =>
      LOCALES.map((locale: Locale) => ({
        url: `${baseUrl}/${locale}/booking/${loc.id}`,
        lastModified: loc.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [
              l,
              `${baseUrl}/${l}/booking/${loc.id}`,
            ])
          ),
        },
      }))
    );
  } catch (err) {
    console.warn("[sitemap] failed to load dynamic entries:", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
