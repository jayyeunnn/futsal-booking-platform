import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { BookingLocationSearch } from "@/components/booking/BookingLocationSearch";
import { BookingStepper } from "@/components/booking/BookingStepper";

export const revalidate = 60;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop";

export default async function BookingSelectLocationPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { search?: string };
}) {
  const search = searchParams.search?.trim() ?? "";
  const locale = params.locale;

  // Real DB query — pakai schema yang sama dengan /api/locations.
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      courts: {
        where: { isActive: true },
        select: {
          id: true,
          type: true,
          reviews: { where: { isVisible: true }, select: { rating: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = locations.map((loc) => {
    const indoor = loc.courts.filter((c) => c.type === "INDOOR").length;
    const outdoor = loc.courts.filter((c) => c.type === "OUTDOOR").length;
    const allRatings = loc.courts.flatMap((c) => c.reviews.map((r) => r.rating));
    const avgRating =
      allRatings.length > 0
        ? Math.round(
            (allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10,
          ) / 10
        : null;
    return {
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      openTime: loc.openTime,
      closeTime: loc.closeTime,
      thumbnailUrl: loc.thumbnailUrl,
      totalCourts: loc.courts.length,
      indoor,
      outdoor,
      avgRating,
      totalReviews: allRatings.length,
    };
  });

  const heading = locale === "en" ? "Select Location" : "Pilih Lokasi";
  const breadcrumb = locale === "en" ? "Booking" : "Booking";
  const noResults =
    locale === "en"
      ? `No location matches "${search}".`
      : `Tidak ada lokasi yang cocok dengan "${search}".`;
  const emptyState =
    locale === "en"
      ? "No active locations yet. Please check back soon."
      : "Belum ada lokasi aktif. Silakan cek kembali nanti.";
  const courtsLabel = locale === "en" ? "courts" : "lapangan";
  const reviewsLabel = locale === "en" ? "reviews" : "ulasan";
  const ctaLabel =
    locale === "en" ? "Pick this location" : "Pilih lokasi ini";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-[72px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-text-secondary mb-6">
            <span>{breadcrumb}</span>
            <span className="mx-2">/</span>
            <span className="text-text-primary font-medium">{heading}</span>
          </nav>

          <h1 className="text-3xl font-heading font-bold text-text-primary mb-6">
            {heading}
          </h1>

          <BookingStepper current="location" locale={locale} />

          <BookingLocationSearch
            locale={locale}
            initialValue={search}
          />

          <div className="space-y-4">
            {data.map((location) => (
              <Link
                key={location.id}
                href={`/${locale}/booking/${location.id}`}
                className="block bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 h-40 sm:h-auto overflow-hidden shrink-0">
                    <Image
                      src={location.thumbnailUrl || FALLBACK_IMG}
                      alt={location.name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-text-primary">
                        {location.name}
                      </h3>
                      <div className="flex items-start gap-2 mt-1.5 text-sm text-text-secondary">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                          {location.address}, {location.city}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-text-secondary">
                        <span>
                          🏟️ {location.totalCourts} {courtsLabel}
                          {location.totalCourts > 0 && (
                            <span className="ml-1 text-xs">
                              ({location.indoor} indoor · {location.outdoor}{" "}
                              outdoor)
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {location.openTime} - {location.closeTime}
                        </span>
                        {location.avgRating !== null && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                            {location.avgRating} ({location.totalReviews}{" "}
                            {reviewsLabel})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                      {ctaLabel} <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {data.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                {search ? noResults : emptyState}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
