import type { Metadata } from "next";

/**
 * Centralized SEO configuration.
 * Site-wide defaults are kept here so per-page metadata stays minimal and
 * stays in sync (canonical URL, OG image, twitter handle, etc.).
 */
export const siteConfig = {
  name: "JayField",
  description: {
    id: "Booking lapangan futsal jadi lebih mudah. Pilih, pesan, dan main. Semudah itu.",
    en: "Book futsal courts the easy way. Choose, book, and play. It's that simple.",
  },
  url: process.env.NEXT_PUBLIC_APP_URL || "https://jayfield.com",
  ogImage: "/og-image.jpg",
  twitter: "@jayfield",
  keywords: {
    id: [
      "futsal",
      "booking lapangan futsal",
      "sewa lapangan futsal",
      "lapangan futsal jakarta",
      "jayfield",
      "main futsal",
      "lapangan indoor",
      "lapangan outdoor",
    ],
    en: [
      "futsal",
      "futsal court booking",
      "futsal court rental",
      "futsal court jakarta",
      "jayfield",
      "indoor futsal",
      "outdoor futsal",
    ],
  },
} as const;

export type SeoLocale = "id" | "en";

type BuildMetadataOptions = {
  /** Bahasa Indonesia title (primary). */
  titleId?: string;
  /** English title. */
  titleEn?: string;
  /** Bahasa Indonesia description (primary). */
  descriptionId?: string;
  /** English description. */
  descriptionEn?: string;
  /** Current locale. */
  locale: string;
  /** Path relative to locale root, must start with `/` (e.g. "/", "/locations"). */
  path: string;
  /** Optional override for OG image (defaults to site OG image). */
  image?: string;
  /** When true, marks the page noindex/nofollow. */
  noIndex?: boolean;
  /** Extra keywords to merge with site defaults. */
  extraKeywords?: string[];
};

const stripTrailing = (s: string) => s.replace(/\/+$/, "");

/**
 * Build a Next.js Metadata object with locale-aware title/description,
 * OpenGraph + Twitter, canonical URL, and hreflang alternates.
 */
export function buildMetadata({
  titleId,
  titleEn,
  descriptionId,
  descriptionEn,
  locale,
  path,
  image,
  noIndex = false,
  extraKeywords = [],
}: BuildMetadataOptions): Metadata {
  const isId = locale === "id";
  const title =
    (isId ? titleId ?? titleEn : titleEn ?? titleId) ?? siteConfig.name;
  const description =
    (isId ? descriptionId ?? descriptionEn : descriptionEn ?? descriptionId) ??
    (isId ? siteConfig.description.id : siteConfig.description.en);

  const ogLocale = isId ? "id_ID" : "en_US";
  const alternateLocale = isId ? "en_US" : "id_ID";
  const ogImage = image ?? siteConfig.ogImage;

  const baseUrl = stripTrailing(siteConfig.url);
  const cleanPath = path === "/" ? "" : path;
  const canonical = `${baseUrl}/${locale}${cleanPath}`;
  const idUrl = `${baseUrl}/id${cleanPath}`;
  const enUrl = `${baseUrl}/en${cleanPath}`;

  const keywords = [
    ...(isId ? siteConfig.keywords.id : siteConfig.keywords.en),
    ...extraKeywords,
  ];

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        id: idUrl,
        en: enUrl,
        "x-default": idUrl,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export type SeoLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  openTime?: string | null;
  closeTime?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
};

/**
 * Build JSON-LD `@graph` for the organization plus a SportsActivityLocation
 * entry per location. Drop into a `<script type="application/ld+json">`.
 */
export function localBusinessJsonLd(
  locations: SeoLocation[],
  locale: SeoLocale = "id"
) {
  const baseUrl = stripTrailing(siteConfig.url);
  const description =
    locale === "id" ? siteConfig.description.id : siteConfig.description.en;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#organization`,
        name: siteConfig.name,
        url: baseUrl,
        logo: `${baseUrl}${siteConfig.ogImage}`,
        image: `${baseUrl}${siteConfig.ogImage}`,
        description,
        sameAs: [
          "https://instagram.com/jayfield",
          "https://facebook.com/jayfield",
        ],
      },
      ...locations.map((loc) => {
        const lat =
          typeof loc.latitude === "string"
            ? Number(loc.latitude)
            : loc.latitude ?? undefined;
        const lng =
          typeof loc.longitude === "string"
            ? Number(loc.longitude)
            : loc.longitude ?? undefined;

        return {
          "@type": "SportsActivityLocation",
          "@id": `${baseUrl}/${locale}/booking/${loc.id}`,
          name: loc.name,
          ...(loc.description ? { description: loc.description } : {}),
          address: {
            "@type": "PostalAddress",
            streetAddress: loc.address,
            addressLocality: loc.city,
            addressCountry: "ID",
          },
          ...(typeof lat === "number" &&
          typeof lng === "number" &&
          Number.isFinite(lat) &&
          Number.isFinite(lng)
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: lat,
                  longitude: lng,
                },
              }
            : {}),
          ...(loc.phone ? { telephone: loc.phone } : {}),
          ...(loc.email ? { email: loc.email } : {}),
          ...(loc.thumbnailUrl ? { image: loc.thumbnailUrl } : {}),
          openingHours: `Mo-Su ${loc.openTime ?? "08:00"}-${loc.closeTime ?? "00:00"}`,
          url: `${baseUrl}/${locale}/booking/${loc.id}`,
          sport: "Futsal",
        };
      }),
    ],
  };
}
