import Link from "next/link";
import { redirect } from "next/navigation";
import { Repeat, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { RecurringBookingActions } from "@/components/dashboard/RecurringBookingActions";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

const DAY_LABEL = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default async function DashboardRecurringPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const recurrings = await prisma.recurringBooking.findMany({
    where: { userId: session.id },
    include: {
      court: {
        include: { location: { select: { id: true, name: true } } },
      },
      bookings: {
        select: { id: true, bookingDate: true, status: true },
        orderBy: { bookingDate: "desc" },
        take: 5,
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  const dateLocale = params.locale === "id" ? idLocale : enUS;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
            Booking Berulang
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Booking otomatis tiap minggu di hari & jam yang sama
          </p>
        </div>
        <Link
          href={`/${params.locale}/booking`}
          className="inline-flex items-center gap-1 h-9 px-4 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold"
        >
          + Booking Baru
        </Link>
      </div>

      <div className="bg-info/5 border border-info/20 rounded-xl p-4 text-sm text-text-secondary">
        <p className="flex items-start gap-2">
          <Repeat className="h-4 w-4 mt-0.5 text-info shrink-0" />
          <span>
            Booking berulang dibuat otomatis tiap hari (00:01 WIB) untuk minggu
            depan. Kamu akan dapat notifikasi untuk menyelesaikan pembayaran dalam
            1 jam. Slot yang bentrok dengan booking lain akan dilewati.
          </span>
        </p>
      </div>

      {recurrings.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-recurring"
            action={{
              label: "Cari Lapangan",
              href: `/${params.locale}/booking`,
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {recurrings.map((r) => {
            const completedCount = r.bookings.filter(
              (b) => b.status === "COMPLETED"
            ).length;
            const upcomingCount = r.bookings.filter((b) =>
              ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"].includes(
                b.status
              )
            ).length;
            return (
              <div
                key={r.id}
                className={`bg-surface border rounded-xl p-5 ${
                  r.isActive ? "border-border" : "border-border opacity-60"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {r.court.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          r.isActive
                            ? "bg-success/10 text-success"
                            : "bg-text-secondary/10 text-text-secondary"
                        }`}
                      >
                        {r.isActive ? "Aktif" : "Pause"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" /> {r.court.location.name}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-text-secondary">Hari</p>
                        <p className="font-medium text-text-primary">
                          {DAY_LABEL[r.dayOfWeek]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Jam</p>
                        <p className="font-medium text-text-primary">
                          {r.startTime} - {r.endTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Mulai</p>
                        <p className="font-medium text-text-primary">
                          {format(r.startDate, "dd MMM yyyy", {
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Berakhir</p>
                        <p className="font-medium text-text-primary">
                          {r.endDate
                            ? format(r.endDate, "dd MMM yyyy", {
                                locale: dateLocale,
                              })
                            : "Sampai dibatalkan"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {upcomingCount} mendatang
                      </span>
                      <span>{completedCount} selesai</span>
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <RecurringBookingActions
                      recurringId={r.id}
                      isActive={r.isActive}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
