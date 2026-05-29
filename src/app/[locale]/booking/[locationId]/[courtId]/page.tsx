import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { ScheduleSlotPicker } from "@/components/booking/ScheduleSlotPicker";
import { BookingStepper } from "@/components/booking/BookingStepper";

export const dynamic = "force-dynamic";

export default async function BookingSelectSchedulePage({
  params,
}: {
  params: { locale: string; locationId: string; courtId: string };
}) {
  const locale = params.locale;

  // Validate court + location pair against DB.
  const court = await prisma.court.findUnique({
    where: { id: params.courtId },
    select: {
      id: true,
      name: true,
      type: true,
      surface: true,
      isActive: true,
      location: { select: { id: true, name: true, isActive: true } },
    },
  });
  if (
    !court ||
    !court.isActive ||
    court.location.id !== params.locationId ||
    !court.location.isActive
  ) {
    notFound();
  }

  const heading =
    locale === "en" ? "Select Schedule" : "Pilih Jadwal";
  const back = locale === "en" ? "Back to courts" : "Kembali ke daftar lapangan";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-[72px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-text-secondary mb-4">
            <Link
              href={`/${locale}/booking`}
              className="hover:text-primary transition-colors"
            >
              Booking
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/${locale}/booking/${params.locationId}`}
              className="hover:text-primary transition-colors"
            >
              {court.location.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary font-medium">{heading}</span>
          </nav>

          <Link
            href={`/${locale}/booking/${params.locationId}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {back}
          </Link>

          <h1 className="text-3xl font-heading font-bold text-text-primary mb-1">
            {heading}
          </h1>
          <p className="text-text-secondary mb-6">
            {court.name} · {court.type}
            {court.surface ? ` · ${court.surface}` : ""}
          </p>

          <BookingStepper current="schedule" locale={locale} />

          <ScheduleSlotPicker
            locale={locale}
            locationId={params.locationId}
            courtId={params.courtId}
            courtName={court.name}
          />
        </div>
      </main>
    </>
  );
}
