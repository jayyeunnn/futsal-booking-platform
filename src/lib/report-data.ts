/**
 * Direct DB report helpers.
 *
 * These are used by both the admin reports page (server component) and the
 * `/api/admin/reports/*` routes so we avoid HTTP self-calls and keep the
 * grouping/derivation logic in a single place.
 */

import prisma from "@/lib/prisma";
import {
  bucketKey,
  diffDays,
  formatDateOnly,
  listBuckets,
  OPERATING_HOURS_PER_DAY,
  type GroupBy,
} from "@/lib/reports";

export type RevenuePoint = {
  period: string;
  revenue: number;
  transactions: number;
};

export type RevenueReport = {
  groupBy: GroupBy;
  series: RevenuePoint[];
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    uniqueBookings: number;
  };
};

export async function getRevenueReport(
  from: Date,
  to: Date,
  groupBy: GroupBy = "day"
): Promise<RevenueReport> {
  const payments = await prisma.payment.findMany({
    where: {
      status: "CONFIRMED",
      confirmedAt: { gte: from, lt: to },
    },
    select: {
      amount: true,
      confirmedAt: true,
      bookingId: true,
    },
  });

  const totals = new Map<string, number>();
  const counts = new Map<string, number>();
  const bookingIds = new Set<string>();
  let grandTotal = 0;

  for (const p of payments) {
    if (!p.confirmedAt) continue;
    const key = bucketKey(p.confirmedAt, groupBy);
    const amount = Number(p.amount);
    totals.set(key, (totals.get(key) ?? 0) + amount);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    grandTotal += amount;
    bookingIds.add(p.bookingId);
  }

  const series = listBuckets(from, to, groupBy).map((key) => ({
    period: key,
    revenue: Math.round(totals.get(key) ?? 0),
    transactions: counts.get(key) ?? 0,
  }));

  return {
    groupBy,
    series,
    summary: {
      totalRevenue: Math.round(grandTotal),
      totalTransactions: payments.length,
      uniqueBookings: bookingIds.size,
    },
  };
}

export type OccupancyDayPoint = {
  period: string;
  bookedHours: number;
  availableHours: number;
  occupancyPct: number;
};

export type OccupancyCourtRow = {
  courtId: string;
  courtName: string;
  locationName: string;
  bookedHours: number;
  availableHours: number;
  occupancyPct: number;
};

export type OccupancyReport = {
  series: OccupancyDayPoint[];
  perCourt: OccupancyCourtRow[];
  courtCount: number;
  summary: {
    totalBookedHours: number;
    totalAvailableHours: number;
    occupancyPct: number;
  };
};

export async function getOccupancyReport(
  from: Date,
  to: Date,
  courtId?: string | null
): Promise<OccupancyReport> {
  const [activeCourts, bookings] = await Promise.all([
    prisma.court.findMany({
      where: {
        isActive: true,
        ...(courtId ? { id: courtId } : {}),
      },
      select: { id: true, name: true, location: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        bookingDate: { gte: from, lt: to },
        status: { in: ["CONFIRMED", "COMPLETED", "PENDING_CONFIRMATION"] },
        ...(courtId ? { courtId } : {}),
      },
      select: {
        courtId: true,
        bookingDate: true,
        durationHours: true,
      },
    }),
  ]);

  const courtCount = activeCourts.length;
  const totalDays = diffDays(from, to);
  const totalCapacity = courtCount * totalDays * OPERATING_HOURS_PER_DAY;
  const dailyCapacity = courtCount * OPERATING_HOURS_PER_DAY;

  const dailyBooked = new Map<string, number>();
  const perCourtBooked = new Map<string, number>();
  let grandBooked = 0;

  for (const b of bookings) {
    const key = formatDateOnly(b.bookingDate);
    const hours = Number(b.durationHours);
    dailyBooked.set(key, (dailyBooked.get(key) ?? 0) + hours);
    perCourtBooked.set(b.courtId, (perCourtBooked.get(b.courtId) ?? 0) + hours);
    grandBooked += hours;
  }

  const series = listBuckets(from, to, "day").map((key) => {
    const booked = round1(dailyBooked.get(key) ?? 0);
    const rate =
      dailyCapacity > 0 ? Math.round((booked / dailyCapacity) * 100) : 0;
    return {
      period: key,
      bookedHours: booked,
      availableHours: dailyCapacity,
      occupancyPct: rate,
    };
  });

  const perCourt = activeCourts
    .map((c) => {
      const booked = round1(perCourtBooked.get(c.id) ?? 0);
      const courtCapacity = totalDays * OPERATING_HOURS_PER_DAY;
      const rate =
        courtCapacity > 0 ? Math.round((booked / courtCapacity) * 100) : 0;
      return {
        courtId: c.id,
        courtName: c.name,
        locationName: c.location.name,
        bookedHours: booked,
        availableHours: courtCapacity,
        occupancyPct: rate,
      };
    })
    .sort((a, b) => b.occupancyPct - a.occupancyPct);

  const overallRate =
    totalCapacity > 0 ? Math.round((grandBooked / totalCapacity) * 100) : 0;

  return {
    series,
    perCourt,
    courtCount,
    summary: {
      totalBookedHours: round1(grandBooked),
      totalAvailableHours: totalCapacity,
      occupancyPct: overallRate,
    },
  };
}

export type MemberPoint = {
  period: string;
  newMembers: number;
  cumulativeMembers: number;
};

export type MemberReport = {
  series: MemberPoint[];
  tierDistribution: Record<"BRONZE" | "SILVER" | "GOLD", number>;
  summary: {
    newInRange: number;
    cumulativeAtEnd: number;
    priorTotal: number;
  };
};

export async function getMemberReport(
  from: Date,
  to: Date
): Promise<MemberReport> {
  const [newUsers, baselineCount, tierGroups] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "USER",
        createdAt: { gte: from, lt: to },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({
      where: { role: "USER", createdAt: { lt: from } },
    }),
    prisma.user.groupBy({
      by: ["tier"],
      where: { role: "USER" },
      _count: { _all: true },
    }),
  ]);

  const buckets = listBuckets(from, to, "day");
  const perDay = new Map<string, number>();
  for (const u of newUsers) {
    const key = formatDateOnly(u.createdAt);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  let runningTotal = baselineCount;
  const series = buckets.map((key) => {
    const newCount = perDay.get(key) ?? 0;
    runningTotal += newCount;
    return {
      period: key,
      newMembers: newCount,
      cumulativeMembers: runningTotal,
    };
  });

  const tierDistribution = {
    BRONZE: 0,
    SILVER: 0,
    GOLD: 0,
  } as Record<"BRONZE" | "SILVER" | "GOLD", number>;
  for (const g of tierGroups) {
    tierDistribution[g.tier] = g._count._all;
  }

  return {
    series,
    tierDistribution,
    summary: {
      newInRange: newUsers.length,
      cumulativeAtEnd: runningTotal,
      priorTotal: baselineCount,
    },
  };
}

export type TopCourtRow = {
  courtId: string;
  courtName: string;
  locationName: string;
  bookings: number;
  totalHours: number;
};

/**
 * Top courts by booking count in the date range. Excludes cancelled/expired
 * bookings since those don't reflect real demand.
 */
export async function getTopCourts(
  from: Date,
  to: Date,
  limit = 10
): Promise<TopCourtRow[]> {
  const groups = await prisma.booking.groupBy({
    by: ["courtId"],
    where: {
      bookingDate: { gte: from, lt: to },
      status: { in: ["CONFIRMED", "COMPLETED", "PENDING_CONFIRMATION"] },
    },
    _count: { _all: true },
    _sum: { durationHours: true },
  });

  if (groups.length === 0) return [];

  // Sort by count desc and take top N before fetching court info.
  const top = groups
    .slice()
    .sort((a, b) => (b._count._all ?? 0) - (a._count._all ?? 0))
    .slice(0, limit);

  const courts = await prisma.court.findMany({
    where: { id: { in: top.map((g) => g.courtId) } },
    select: { id: true, name: true, location: { select: { name: true } } },
  });
  const courtMap = new Map(courts.map((c) => [c.id, c]));

  return top.map((g) => {
    const court = courtMap.get(g.courtId);
    return {
      courtId: g.courtId,
      courtName: court?.name ?? "—",
      locationName: court?.location.name ?? "—",
      bookings: g._count._all ?? 0,
      totalHours: round1(Number(g._sum.durationHours ?? 0)),
    };
  });
}

export type CancellationPoint = {
  period: string;
  total: number;
  cancelled: number;
  cancellationRate: number;
};

export type CancellationReport = {
  series: CancellationPoint[];
  summary: {
    totalBookings: number;
    cancelledBookings: number;
    cancellationRate: number;
  };
};

/**
 * Cancellation rate per period. Numerator = bookings with status CANCELLED
 * or EXPIRED, denominator = ALL bookings created in that period (including
 * the cancelled/expired ones, so the percentage stays bounded 0-100).
 */
export async function getCancellationReport(
  from: Date,
  to: Date,
  groupBy: GroupBy = "day"
): Promise<CancellationReport> {
  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: from, lt: to } },
    select: { createdAt: true, status: true },
  });

  const totalsPerBucket = new Map<string, number>();
  const cancelledPerBucket = new Map<string, number>();
  let totalAll = 0;
  let cancelledAll = 0;

  for (const b of bookings) {
    const key = bucketKey(b.createdAt, groupBy);
    totalsPerBucket.set(key, (totalsPerBucket.get(key) ?? 0) + 1);
    totalAll += 1;
    if (b.status === "CANCELLED" || b.status === "EXPIRED") {
      cancelledPerBucket.set(key, (cancelledPerBucket.get(key) ?? 0) + 1);
      cancelledAll += 1;
    }
  }

  const series = listBuckets(from, to, groupBy).map((key) => {
    const total = totalsPerBucket.get(key) ?? 0;
    const cancelled = cancelledPerBucket.get(key) ?? 0;
    const rate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    return {
      period: key,
      total,
      cancelled,
      cancellationRate: rate,
    };
  });

  const overallRate =
    totalAll > 0 ? Math.round((cancelledAll / totalAll) * 100) : 0;

  return {
    series,
    summary: {
      totalBookings: totalAll,
      cancelledBookings: cancelledAll,
      cancellationRate: overallRate,
    },
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
