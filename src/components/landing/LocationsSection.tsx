import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowRight, Building2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=400&auto=format&fit=crop";

/**
 * Server component — fetches all active locations with court count
 * and average rating from real DB data.
 */
export default async function LocationsSection({
  locale = "id",
}: {
  locale?: string;
}) {
  const t = await getTranslations("landing");

  const locations = await prisma.location.findMany({
    where: { isActive: true },
    include: {
      courts: {
        where: { isActive: true },
        select: {
          id: true,
          reviews: { where: { isVisible: true }, select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  return (
    <section id="locations" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            {t("locations_title")}
          </h2>
          <p className="mt-3 text-text-secondary text-lg">
            {t("locations_subtitle")}
          </p>
        </div>
        {locations.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada lokasi terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => {
              const allRatings = location.courts.flatMap((c) =>
                c.reviews.map((r) => r.rating)
              );
              const avgRating =
                allRatings.length > 0
                  ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
                  : null;
              const reviewCount = allRatings.length;
              const image = location.thumbnailUrl ?? FALLBACK_IMAGE;

              return (
                <div
                  key={location.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={image}
                      alt={location.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-heading font-semibold text-text-primary line-clamp-1">
                      {location.name}
                    </h3>
                    <div className="flex items-start gap-2 mt-2 text-sm text-text-secondary">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{location.address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {location.courts.length} Lapangan
                      </span>
                      {avgRating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                          {avgRating.toFixed(1)} ({reviewCount})
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/${locale}/booking/${location.id}`}
                      className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                    >
                      Pilih Lokasi <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
