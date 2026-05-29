import { ImageIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { GalleryGrid } from "./GalleryGrid";

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?q=80&w=600&auto=format&fit=crop",
];

/**
 * Server component — aggregate all court photos from DB. When admin hasn't
 * uploaded any photos yet, falls back to evergreen Unsplash showcase
 * so landing never looks empty.
 */
export default async function GallerySection() {
  const t = await getTranslations("landing");

  const courts = await prisma.court.findMany({
    where: { isActive: true },
    select: { name: true, photos: true },
    take: 20,
  });

  const dbPhotos = courts.flatMap((c) => {
    const arr = (c.photos as string[] | null) ?? [];
    return arr.slice(0, 3).map((url) => ({ src: url, alt: c.name }));
  });

  // Use DB photos if any, otherwise fallback. Cap at 8 for layout.
  const photos =
    dbPhotos.length > 0
      ? dbPhotos.slice(0, 8)
      : FALLBACK_PHOTOS.map((src) => ({ src, alt: "Lapangan futsal JayField" }));

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            {t("gallery_title")}
          </h2>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Foto akan segera ditambahkan.</p>
          </div>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </div>
    </section>
  );
}
