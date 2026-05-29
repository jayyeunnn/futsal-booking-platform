import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import BookingsOfflineCache, {
  type CachedBookingItem,
} from "@/components/dashboard/BookingsOfflineCache";
import type { BookingStatus } from "@/types";

export const dynamic = "force-dynamic";

const TABS = ["upcoming", "completed", "cancelled"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  upcoming: "Mendatang",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const TAB_FILTERS: Record<Tab, BookingStatus[]> = {
  upcoming: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED", "EXPIRED"],
};

export default async function DashboardBookingsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { tab?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const tabParam = searchParams.tab as Tab | undefined;
  const tab: Tab = TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : "upcoming";
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const where = {
    userId: session.id,
    status: { in: TAB_FILTERS[tab] },
  };

  const [bookings, total, counts] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        court: {
          include: { location: { select: { name: true, address: true } } },
        },
        payments: {
          select: { id: true, status: true, amount: true, expiresAt: true },
        },
      },
      orderBy:
        tab === "upcoming"
          ? [{ bookingDate: "asc" }, { startTime: "asc" }]
          : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
    Promise.all(
      TABS.map((t) =>
        prisma.booking.count({
          where: { userId: session.id, status: { in: TAB_FILTERS[t] } },
        })
      )
    ),
  ]);

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const totalPages = Math.ceil(total / limit);

  // Snapshot for offline cache — keeps client-side localStorage warm so
  // a future no-network visit can still render the user's recent bookings.
  const cacheSnapshot: CachedBookingItem[] = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    bookingDate: b.bookingDate.toISOString(),
    startTime: b.startTime,
    endTime: b.endTime,
    totalPrice: Number(b.totalPrice),
    paymentType: b.paymentType,
    courtName: b.court.name,
    locationName: b.court.location.name,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BookingsOfflineCache
        userId={session.id}
        serverItems={cacheSnapshot}
      />
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Booking Saya
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Riwayat semua booking kamu
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t, i) => {
          const isActive = tab === t;
          return (
            <Link
              key={t}
              href={`/${params.locale}/dashboard/bookings?tab=${t}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-muted"
              }`}
            >
              {TAB_LABEL[t]}{" "}
              <span
                className={`ml-1 text-xs ${
                  isActive ? "text-white/80" : "text-text-secondary"
                }`}
              >
                ({counts[i]})
              </span>
            </Link>
          );
        })}
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-bookings"
            description={
              tab === "upcoming"
                ? "Saatnya main futsal! Pilih lapangan favorit kamu dan booking dalam hitungan menit."
                : tab === "completed"
                  ? "Belum ada booking yang selesai. Setelah selesai main, booking akan muncul di sini."
                  : "Belum ada booking yang dibatalkan. Semua booking aktif kamu masih on-track 👌"
            }
            action={
              tab === "upcoming"
                ? {
                    label: "Booking Sekarang",
                    href: `/${params.locale}/booking`,
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const formattedDate = format(b.bookingDate, "EEE, dd MMM yyyy", {
              locale: dateLocale,
            });
            return (
              <Link
                key={b.id}
                href={`/${params.locale}/dashboard/bookings/${b.id}`}
                className="block bg-surface border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {b.court.name}
                      </p>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-text-secondary flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />{" "}
                      {b.court.location.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formattedDate} · {b.startTime} - {b.endTime}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-heading font-bold text-text-primary">
                      Rp {Number(b.totalPrice).toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {b.paymentType === "DP" ? "DP 50%" : "Bayar Full"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Halaman {page} dari {totalPages} ({total} booking)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/${params.locale}/dashboard/bookings?tab=${tab}&page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
              >
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/${params.locale}/dashboard/bookings?tab=${tab}&page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
