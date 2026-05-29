import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { getMemberDiscountPct } from "@/lib/rewards";
import type { MemberTier } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { BookingConfirmForm } from "@/components/booking/BookingConfirmForm";
import { BookingStepper } from "@/components/booking/BookingStepper";

export const dynamic = "force-dynamic";

type SearchParams = {
  courtId?: string;
  locationId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  total?: string;
  recurring?: string;
};

/**
 * Konfirmasi & Bayar — server component yang:
 *   1. Auth guard (redirect ke login dengan callbackUrl).
 *   2. Validasi context booking dari URL query (courtId/date/startTime/endTime).
 *   3. Fetch payment methods (bank + e-wallet) dari DB.
 *   4. Kalkulasi estimated price ulang dari pricing tabel.
 *   5. Ambil member tier untuk preview diskon.
 *   6. Render BookingConfirmForm (client) yang nge-POST ke /api/bookings.
 */
export default async function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const locale = params.locale;
  const session = await getSessionUser();
  const callbackUrl = encodeURIComponent(buildCallback(locale, searchParams));
  if (!session) {
    redirect(`/${locale}/login?callbackUrl=${callbackUrl}`);
  }

  // Validate required URL parameters.
  const {
    courtId,
    locationId,
    date,
    startTime,
    endTime,
    duration,
    recurring,
  } = searchParams;

  const isEN = locale === "en";
  const t = (id: string, en: string) => (isEN ? en : id);

  if (!courtId || !date || !startTime || !endTime || !duration) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-muted pt-[72px]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
              {t("Data booking tidak lengkap", "Incomplete booking data")}
            </h1>
            <p className="text-text-secondary mb-6">
              {t(
                "Silakan mulai ulang dari halaman pilih lokasi.",
                "Please restart from the location selection page.",
              )}
            </p>
            <Link
              href={`/${locale}/booking`}
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
            >
              {t("Mulai Booking", "Start Booking")}
            </Link>
          </div>
        </main>
      </>
    );
  }

  const durationHours = parseInt(duration, 10);
  if (Number.isNaN(durationHours) || durationHours < 1) {
    redirect(`/${locale}/booking`);
  }

  // Resolve court + pricing + location.
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: {
      location: {
        select: { id: true, name: true, isActive: true },
      },
      pricing: { where: { isActive: true } },
    },
  });
  if (!court || !court.isActive || !court.location.isActive) {
    redirect(`/${locale}/booking`);
  }

  if (locationId && court.location.id !== locationId) {
    redirect(`/${locale}/booking`);
  }

  // Re-compute subtotal authoritatively from DB pricing so the user can't
  // tamper with the URL `total` param to pay less than the real cost.
  const bookingDate = new Date(date);
  if (Number.isNaN(bookingDate.getTime())) {
    redirect(`/${locale}/booking`);
  }
  const dayOfWeek = bookingDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType: "WEEKEND" | "WEEKDAY" = isWeekend ? "WEEKEND" : "WEEKDAY";

  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHourRaw = parseInt(endTime.split(":")[0], 10);
  const endHour = endHourRaw === 0 ? 24 : endHourRaw;

  let estimatedSubtotal = 0;
  for (let h = startHour; h < endHour; h++) {
    const timeType: "PRIME_TIME" | "REGULAR" = h >= 16 ? "PRIME_TIME" : "REGULAR";
    const pricing = court.pricing.find(
      (p) => p.dayType === dayType && p.timeType === timeType,
    );
    if (pricing) estimatedSubtotal += Number(pricing.pricePerHour);
  }

  // Payment methods (active only).
  const paymentMethodsAll = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      accountNumber: true,
      accountHolder: true,
    },
  });

  const paymentMethods = {
    bank: paymentMethodsAll.filter((m) => m.type === "BANK_TRANSFER"),
    eWallet: paymentMethodsAll.filter((m) => m.type === "E_WALLET"),
  };

  // Member tier for discount preview.
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { tier: true },
  });
  const tier = (user?.tier ?? "BRONZE") as MemberTier;
  const memberDiscountPct = getMemberDiscountPct(tier);

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
            <span className="text-text-primary font-medium">
              {t("Konfirmasi & Bayar", "Confirm & Pay")}
            </span>
          </nav>

          <h1 className="text-3xl font-heading font-bold text-text-primary mb-6">
            {t("Konfirmasi & Bayar", "Confirm & Pay")}
          </h1>

          <BookingStepper current="confirm" locale={locale} />

          <BookingConfirmForm
            locale={locale}
            courtId={courtId}
            bookingDate={date}
            startTime={startTime}
            endTime={endTime}
            duration={durationHours}
            recurring={recurring === "true"}
            courtName={court.name}
            locationName={court.location.name}
            estimatedSubtotal={estimatedSubtotal}
            memberDiscountPct={memberDiscountPct}
            paymentMethods={paymentMethods}
          />
        </div>
      </main>
    </>
  );
}

function buildCallback(locale: string, sp: SearchParams): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/${locale}/booking/confirm?${qs}` : `/${locale}/booking/confirm`;
}
