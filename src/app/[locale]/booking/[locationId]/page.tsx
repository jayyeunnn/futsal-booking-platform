import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Building2, Sun, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { CourtTypeFilter } from "@/components/booking/CourtTypeFilter";
import { BookingStepper } from "@/components/booking/BookingStepper";

export const revalidate = 60;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600&auto=format&fit=crop";

export default async function BookingSelectCourtPage({
  params,
  searchParams,
}: {
  params: { locale: string; locationId: string };
  searchParams: { type?: string };
}) {
  const locale = params.locale;
  const filterType = searchParams.type === "INDOOR" || searchParams.type === "OUTDOOR"
    ? (searchParams.type as "INDOOR" | "OUTDOOR")
    : "ALL";

  const location = await prisma.location.findUnique({
    where: { id: params.locationId },
    select: { id: true, name: true, isActive: true },
  });
  if (!location || !location.isActive) notFound();

  const courts = await prisma.court.findMany({
    where: {
      locationId: params.locationId,
      isActive: true,
      ...(filterType !== "ALL" && { type: filterType }),
    },
    include: {
      pricing: {
        where: { isActive: true },
        orderBy: { pricePerHour: "asc" },
        take: 1,
      },
      reviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = courts.map((c) => {
    const photos = Array.isArray(c.photos) ? (c.photos as string[]) : [];
    const facilities = Array.isArray(c.facilities)
      ? (c.facilities as string[])
      : [];
    const avgRating =
      c.reviews.length > 0
        ? Math.round(
            (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length) *
              10,
          ) / 10
        : null;
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      surface: c.surface ?? "—",
      photo: photos[0] ?? FALLBACK_IMG,
      facilities,
      priceFrom: c.pricing[0] ? Number(c.pricing[0].pricePerHour) : null,
      avgRating,
      totalReviews: c.reviews.length,
    };
  });

  const heading =
    locale === "en" ? "Select Court" : "Pilih Lapangan";
  const back =
    locale === "en" ? "Back to locations" : "Kembali ke lokasi";
  const startingFromLabel =
    locale === "en" ? "Starting from" : "Mulai dari";
  const noCourts =
    locale === "en"
      ? "No courts found for this filter."
      : "Tidak ada lapangan dengan filter ini.";

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-[72px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-text-secondary mb-6">
            <Link
              href={`/${locale}/booking`}
              className="hover:text-primary transition-colors"
            >
              Booking
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/${locale}/booking`}
              className="hover:text-primary transition-colors"
            >
              {location.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary font-medium">{heading}</span>
          </nav>

          <Link
            href={`/${locale}/booking`}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {back}
          </Link>

          <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
            {heading}
          </h1>
          <p className="text-text-secondary mb-6">{location.name}</p>

          <BookingStepper current="court" locale={locale} />

          <CourtTypeFilter locale={locale} current={filterType} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((court) => (
              <Link
                key={court.id}
                href={`/${locale}/booking/${params.locationId}/${court.id}`}
                className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={court.photo}
                    alt={court.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {court.type === "INDOOR" ? (
                      <Building2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Sun className="h-4 w-4 text-cta" />
                    )}
                    <span className="text-xs font-medium text-text-secondary uppercase">
                      {court.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-text-primary">
                    {court.name}
                  </h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {court.surface}
                  </p>
                  {court.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {court.facilities.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                      {court.facilities.length > 3 && (
                        <span className="text-xs text-text-secondary px-2 py-0.5">
                          +{court.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-border">
                    {court.priceFrom !== null ? (
                      <>
                        <p className="text-sm text-text-secondary">
                          {startingFromLabel}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(court.priceFrom)}
                          <span className="text-sm font-normal text-text-secondary">
                            /jam
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-text-secondary italic">
                        {locale === "en"
                          ? "Pricing coming soon"
                          : "Harga belum tersedia"}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              {noCourts}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
