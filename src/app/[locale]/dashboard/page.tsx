import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Trophy, Coins, Bell, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { TIER_THRESHOLDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Dashboard overview — server component for fast initial render.
 * Renders real stats from the database for the signed-in user.
 */
export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("dashboardNav");
  const dateLocale = params.locale === "id" ? idLocale : enUS;

  const [user, activeBookingCount, unreadCount, upcoming] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        tier: true,
        totalPoints: true,
        totalBookings: true,
      },
    }),
    prisma.booking.count({
      where: {
        userId: session.id,
        status: { in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"] },
      },
    }),
    prisma.notification.count({
      where: { userId: session.id, isRead: false },
    }),
    prisma.booking.findMany({
      where: {
        userId: session.id,
        status: { in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"] },
        bookingDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      include: {
        court: {
          select: { name: true, location: { select: { name: true } } },
        },
      },
      orderBy: [{ bookingDate: "asc" }, { startTime: "asc" }],
      take: 3,
    }),
  ]);

  if (!user) redirect(`/${params.locale}/login`);

  const tierLabel = user.tier;
  const nextThreshold =
    user.tier === "BRONZE"
      ? TIER_THRESHOLDS.silver
      : user.tier === "SILVER"
        ? TIER_THRESHOLDS.gold
        : null;

  const stats = [
    {
      icon: Calendar,
      label: t("active_bookings"),
      value: String(activeBookingCount),
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      icon: Coins,
      label: t("total_points"),
      value: user.totalPoints.toLocaleString("id-ID"),
      bg: "bg-cta/10",
      color: "text-cta",
    },
    {
      icon: Trophy,
      label: t("current_tier"),
      value: tierLabel,
      bg: "bg-warning/10",
      color: "text-warning",
    },
    {
      icon: Bell,
      label: t("unread_notif"),
      value: String(unreadCount),
      bg: "bg-info/10",
      color: "text-info",
    },
  ];

  const quickLinks = [
    {
      href: `/${params.locale}/dashboard/bookings`,
      label: tNav("my_bookings"),
      icon: Calendar,
    },
    {
      href: `/${params.locale}/dashboard/membership`,
      label: tNav("membership"),
      icon: Trophy,
    },
    {
      href: `/${params.locale}/dashboard/points`,
      label: tNav("points"),
      icon: Coins,
    },
    {
      href: `/${params.locale}/dashboard/notifications`,
      label: tNav("notifications"),
      icon: Bell,
    },
  ];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PENDING_PAYMENT: "bg-warning/10 text-warning",
      PENDING_CONFIRMATION: "bg-info/10 text-info",
      CONFIRMED: "bg-success/10 text-success",
    };
    const labelMap: Record<string, string> = {
      PENDING_PAYMENT: "Belum Bayar",
      PENDING_CONFIRMATION: "Menunggu Konfirmasi",
      CONFIRMED: "Dikonfirmasi",
    };
    return (
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
          map[s] ?? "bg-muted"
        }`}
      >
        {labelMap[s] ?? s}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t("greeting", { name: user.name })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-heading font-bold text-text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tier Progress */}
      {nextThreshold && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-text-secondary">
                Progress ke tier berikutnya
              </p>
              <p className="text-base font-heading font-semibold text-text-primary">
                {user.tier} →{" "}
                {user.tier === "BRONZE" ? "SILVER" : "GOLD"}
              </p>
            </div>
            <Link
              href={`/${params.locale}/dashboard/membership`}
              className="text-sm text-primary hover:underline"
            >
              Detail
            </Link>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Booking</span>
                <span>
                  {user.totalBookings} / {nextThreshold.bookings}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (user.totalBookings / nextThreshold.bookings) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Poin</span>
                <span>
                  {user.totalPoints.toLocaleString("id-ID")} /{" "}
                  {nextThreshold.points.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-cta rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (user.totalPoints / nextThreshold.points) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <link.icon className="h-6 w-6 text-primary mb-3" />
            <p className="font-medium text-text-primary flex items-center justify-between text-sm">
              {link.label}
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </Link>
        ))}
      </div>

      {/* Upcoming */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">
            {t("upcoming")}
          </h2>
          <Link
            href={`/${params.locale}/dashboard/bookings`}
            className="text-sm text-primary hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t("no_bookings")}</p>
            <Link
              href={`/${params.locale}/booking`}
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary-light"
            >
              Booking Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <Link
                key={b.id}
                href={`/${params.locale}/dashboard/bookings`}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-1">
                    {b.court.name} · {b.court.location.name}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {format(b.bookingDate, "EEE, dd MMM yyyy", {
                      locale: dateLocale,
                    })}{" "}
                    · {b.startTime} - {b.endTime}
                  </p>
                </div>
                {statusBadge(b.status)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
