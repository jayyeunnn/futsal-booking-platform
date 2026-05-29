import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminOverviewPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("admin");

  // Date boundaries for "today"
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Yesterday boundaries (for change comparison)
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const [
    todayBookingCount,
    yesterdayBookingCount,
    todayRevenueAgg,
    pendingPaymentCount,
    activeCourtCount,
    todayCompletedHoursAgg,
    todayBookingsList,
    pendingPaymentsList,
  ] = await Promise.all([
    // Today's bookings
    prisma.booking.count({
      where: {
        bookingDate: { gte: todayStart, lt: todayEnd },
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
    }),
    // Yesterday's bookings (for change %)
    prisma.booking.count({
      where: {
        bookingDate: { gte: yesterdayStart, lt: todayStart },
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
    }),
    // Today's confirmed payment revenue
    prisma.payment.aggregate({
      where: {
        status: "CONFIRMED",
        confirmedAt: { gte: todayStart, lt: todayEnd },
      },
      _sum: { amount: true },
    }),
    // Pending payments awaiting admin confirmation
    prisma.payment.count({
      where: { status: "UPLOADED" },
    }),
    // Total active courts (used for occupancy calc)
    prisma.court.count({ where: { isActive: true } }),
    // Today's booked hours (for occupancy rate calc)
    prisma.booking.aggregate({
      where: {
        bookingDate: { gte: todayStart, lt: todayEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      _sum: { durationHours: true },
    }),
    // List of today's bookings
    prisma.booking.findMany({
      where: {
        bookingDate: { gte: todayStart, lt: todayEnd },
      },
      include: {
        user: { select: { name: true } },
        court: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
      take: 6,
    }),
    // Pending payments awaiting confirmation
    prisma.payment.findMany({
      where: { status: "UPLOADED" },
      include: {
        booking: {
          include: {
            user: { select: { name: true } },
            court: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const todayRevenue = Number(todayRevenueAgg._sum.amount ?? 0);
  const todayBookedHours = Number(todayCompletedHoursAgg._sum.durationHours ?? 0);

  // Occupancy rate: hours booked / total available hours
  // Operating hours per day = 16 (08:00 - 00:00)
  const totalAvailableHours = activeCourtCount * 16;
  const occupancyRate =
    totalAvailableHours > 0
      ? Math.round((todayBookedHours / totalAvailableHours) * 100)
      : 0;

  // Booking change %
  const bookingChange =
    yesterdayBookingCount > 0
      ? Math.round(
          ((todayBookingCount - yesterdayBookingCount) /
            yesterdayBookingCount) *
            100
        )
      : todayBookingCount > 0
        ? 100
        : 0;

  const stats = [
    {
      icon: Calendar,
      label: t("today_bookings"),
      value: todayBookingCount.toString(),
      change: bookingChange !== 0 ? `${bookingChange > 0 ? "+" : ""}${bookingChange}%` : "",
      changePositive: bookingChange >= 0,
      color: "text-primary",
    },
    {
      icon: DollarSign,
      label: t("today_revenue"),
      value: formatRupiah(todayRevenue),
      change: "",
      changePositive: true,
      color: "text-success",
    },
    {
      icon: Clock,
      label: t("pending_payments"),
      value: pendingPaymentCount.toString(),
      change: "",
      changePositive: true,
      color: "text-warning",
    },
    {
      icon: TrendingUp,
      label: t("occupancy_rate"),
      value: `${occupancyRate}%`,
      change: "",
      changePositive: true,
      color: "text-info",
    },
  ];

  const dateLocale = params.locale === "id" ? idLocale : enUS;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">
        {t("overview")}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              {stat.change && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.changePositive
                      ? "text-success bg-success/10"
                      : "text-error bg-error/10"
                  }`}
                >
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-heading font-bold text-text-primary">
              {stat.value}
            </p>
            <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Bookings */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Booking Hari Ini</h3>
            <Link
              href={`/${params.locale}/admin/bookings`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {todayBookingsList.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              Belum ada booking hari ini
            </p>
          ) : (
            <div className="space-y-3">
              {todayBookingsList.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {b.user.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {b.court.name} — {b.startTime}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">
              {t("pending_payments")}
            </h3>
            <Link
              href={`/${params.locale}/admin/payments`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {pendingPaymentsList.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              Tidak ada pembayaran menunggu konfirmasi 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {pendingPaymentsList.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {p.booking.user.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {p.paymentMethod} ·{" "}
                      {format(p.updatedAt, "HH:mm", { locale: dateLocale })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-text-primary shrink-0">
                    {formatRupiah(Number(p.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
