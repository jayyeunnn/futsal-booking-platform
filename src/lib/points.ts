import prisma from "@/lib/prisma";
import { POINTS, TIER_THRESHOLDS } from "@/lib/constants";
import type { MemberTier, PointsType } from "@/types";

export type AwardPointsInput = {
  userId: string;
  amount: number;
  type: PointsType;
  description?: string;
  referenceId?: string;
};

/**
 * Award points to a user. Records history and increments the user's totalPoints.
 * Use a positive `amount` for earning, negative for redemption.
 * Returns the updated totalPoints.
 */
export async function awardPoints(input: AwardPointsInput): Promise<number> {
  const { userId, amount, type, description, referenceId } = input;
  if (amount === 0) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });
    return u?.totalPoints ?? 0;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.pointsHistory.create({
      data: {
        userId,
        amount,
        type,
        description,
        referenceId,
      },
    });

    return tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: amount } },
      select: { totalPoints: true },
    });
  });

  return updated.totalPoints;
}

/**
 * Compute next tier based on cumulative bookings or points.
 * Promotion rules from PRD §3.4.2:
 *   Bronze → Silver: 15 bookings OR 500 points
 *   Silver → Gold:   30 bookings OR 1500 points
 */
export function nextTier(
  currentTier: MemberTier,
  totalBookings: number,
  totalPoints: number
): MemberTier | null {
  if (currentTier === "BRONZE") {
    if (
      totalBookings >= TIER_THRESHOLDS.silver.bookings ||
      totalPoints >= TIER_THRESHOLDS.silver.points
    ) {
      return "SILVER";
    }
  }
  if (currentTier === "SILVER" || currentTier === "BRONZE") {
    // Allow leapfrog from Bronze straight to Gold if thresholds reached.
    if (
      totalBookings >= TIER_THRESHOLDS.gold.bookings ||
      totalPoints >= TIER_THRESHOLDS.gold.points
    ) {
      return "GOLD";
    }
  }
  return null;
}

/**
 * Check whether a user qualifies for a tier upgrade and apply it if so.
 * Returns the new tier when an upgrade happened, otherwise null.
 * Caller is responsible for sending the tier-upgrade notification/email.
 */
export async function maybeUpgradeTier(
  userId: string
): Promise<MemberTier | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, totalBookings: true, totalPoints: true },
  });
  if (!user) return null;

  const target = nextTier(user.tier, user.totalBookings, user.totalPoints);
  if (!target || target === user.tier) return null;

  await prisma.user.update({
    where: { id: userId },
    data: { tier: target },
  });
  return target;
}

/** Off-peak booking bonus check (08:00-16:00). */
export function isOffPeakHour(startTime: string): boolean {
  const hour = parseInt(startTime.split(":")[0] ?? "0", 10);
  return hour >= 8 && hour < 16;
}

export const POINTS_RULES = POINTS;


/**
 * Award booking-completion points + optional off-peak bonus.
 * Idempotent: if points were already awarded for this booking, returns null.
 * Caller should also call `maybeUpgradeTier` afterwards.
 */
export async function awardBookingCompletionPoints(input: {
  userId: string;
  bookingId: string;
  durationHours: number;
  startTime: string;
}): Promise<number | null> {
  // Lazy import to avoid circular type imports at top-level.
  const { default: prisma } = await import("@/lib/prisma");

  // Idempotency guard.
  const existing = await prisma.pointsHistory.findFirst({
    where: {
      userId: input.userId,
      type: "EARNED_BOOKING",
      referenceId: input.bookingId,
    },
    select: { id: true },
  });
  if (existing) return null;

  const earned =
    Math.round(input.durationHours * POINTS.perHour) +
    (isOffPeakHour(input.startTime) ? POINTS.offPeakBonus : 0);

  if (earned <= 0) return 0;

  await awardPoints({
    userId: input.userId,
    amount: earned,
    type: "EARNED_BOOKING",
    description: `Booking selesai (${input.durationHours} jam)`,
    referenceId: input.bookingId,
  });

  // Bump totalBookings counter for tier evaluation.
  await prisma.user.update({
    where: { id: input.userId },
    data: { totalBookings: { increment: 1 } },
  });

  return earned;
}
