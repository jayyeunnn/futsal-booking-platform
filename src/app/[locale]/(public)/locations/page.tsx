import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Star, ArrowRight, Building2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

// ISR — re-fetch from DB at most once per minute.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/locations",
    titleId: "Lokasi Lapangan Futsal JayField",
    titleEn: "JayField Futsal Court Locations",
    descriptionId:
      "Daftar lokasi lapangan futsal JayField. Pilih lokasi terdekat dan booking dalam hitungan menit.",
    descriptionEn:
      "Browse JayField futsal court locations. Pick the nearest venue and book in minutes.",
  });
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop";

export default async function LocationsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    include: {
      courts: {
        where: { isActive: true },
        select: {
          id: true,
          type: true,
          reviews: {
            where: { isVisible: true },
            select: { rating: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="bg-muted">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Lokasi JayField
          </h1>
          <p className="text-lg text-white/85">
            Tersebar di berbagai area strategis Jakarta dan sekitarnya
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {locations.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-text-secondary opacity-30" />
            <p className="text-text-primary font-medium mb-1">
              Belum ada lokasi terdaftar
            </p>
            <p className="text-sm text-text-secondary">
              Lokasi akan segera ditambahkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((location) => {
              const indoorCount = location.courts.filter(
                (c) => c.type === "INDOOR"
              ).length;
              const outdoorCount = location.courts.filter(
                (c) => c.type === "OUTDOOR"
              ).length;
              const ratings = location.courts.flatMap((c) =>
                c.reviews.map((r) => r.rating)
              );
              const avgRating =
                ratings.length > 0
                  ? ratings.reduce((s, r) => s + r, 0) / ratings.length
                  : null;
              const image = location.thumbnailUrl ?? FALLBACK_IMAGE;
              const mapsQuery = encodeURIComponent(
                `${location.name} ${location.address}`
              );

              return (
                <div
                  key={location.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="relative h-48">
                    <Image
                      src={image}
                      alt={location.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
                      {location.name}
                    </h2>
                    {location.description && (
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {location.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm text-text-secondary mb-4">
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                          {location.address}, {location.city}
                        </span>
                      </p>
                      {location.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          {location.phone}
                        </p>
                      )}
                      {location.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          {location.email}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {location.openTime} - {location.closeTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-4 pt-4 border-t border-border">
                      <span>
                        <strong className="text-text-primary">
                          {location.courts.length}
                        </strong>{" "}
                        Lapangan
                      </span>
                      {indoorCount > 0 && (
                        <span>{indoorCount} Indoor</span>
                      )}
                      {outdoorCount > 0 && (
                        <span>{outdoorCount} Outdoor</span>
                      )}
                      {avgRating && (
                        <span className="ml-auto flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          {avgRating.toFixed(1)} ({ratings.length})
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/${params.locale}/booking/${location.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 h-10 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold"
                      >
                        Pilih Lokasi <ArrowRight className="h-4 w-4" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 h-10 px-4 rounded-lg border border-border hover:border-primary text-sm font-medium text-text-primary"
                      >
                        <MapPin className="h-4 w-4" />
                        Maps
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
