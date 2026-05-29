import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { ensureReferralCode } from "@/lib/referrals";

export const dynamic = "force-dynamic";

/**
 * GET /api/members/referrals
 *
 * Returns the current user's referral data:
 * - referralCode: their shareable code (auto-created on first call)
 * - stats: total referees, successful (referee has at least one EARNED_BOOKING),
 *          and total referral points earned
 * - referrals: 10 most recent referees with status + points awarded
 */
export async function GET() {
  try {
    const auth = await requireUser();

    // Make sure the user has a code (idempotent — older users may not have one).
    const referralCode = await ensureReferralCode(auth.id);

    // Fetch up to 10 most recent referees.
    const referees = await prisma.user.findMany({
      where: { referredById: auth.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        createdAt: true,
        isActive: true,
      },
    });

    const refereeIds = referees.map((r) => r.id);

    // Count total referees and successful ones in parallel.
    const [totalReferrals, successfulRefereeIds, referralEarningsAgg] =
      await Promise.all([
        prisma.user.count({ where: { referredById: auth.id } }),
        // Distinct referee ids who have at least one completion-points row.
        prisma.pointsHistory.findMany({
          where: {
            userId: { in: refereeIds.length > 0 ? refereeIds : ["__none__"] },
            type: "EARNED_BOOKING",
          },
          select: { userId: true },
          distinct: ["userId"],
        }),
        // Sum of EARNED_REFERRAL points the user earned (referrer perspective).
        prisma.pointsHistory.aggregate({
          where: { userId: auth.id, type: "EARNED_REFERRAL" },
          _sum: { amount: true },
        }),
      ]);

    const successfulSet = new Set(successfulRefereeIds.map((r) => r.userId));

    // Per-referee bonus rows so we can show the points awarded for each one.
    const bonusRows = await prisma.pointsHistory.findMany({
      where: {
        userId: auth.id,
        type: "EARNED_REFERRAL",
        referenceId: { in: refereeIds.length > 0 ? refereeIds : ["__none__"] },
      },
      select: { referenceId: true, amount: true, createdAt: true },
    });
    const bonusByReferee = new Map<string, { amount: number; awardedAt: Date }>();
    for (const r of bonusRows) {
      if (r.referenceId) {
        bonusByReferee.set(r.referenceId, {
          amount: r.amount,
          awardedAt: r.createdAt,
        });
      }
    }

    // Total successful across ALL referees (not just the visible 10).
    const totalSuccessful = await prisma.user.count({
      where: {
        referredById: auth.id,
        pointsHistory: { some: { type: "EARNED_BOOKING" } },
      },
    });

    const referrals = referees.map((r) => {
      const bonus = bonusByReferee.get(r.id);
      const isSuccessful = successfulSet.has(r.id);
      const status: "successful" | "pending" | "inactive" = !r.isActive
        ? "inactive"
        : isSuccessful
          ? "successful"
          : "pending";
      return {
        id: r.id,
        name: r.name,
        registeredAt: r.createdAt,
        status,
        pointsAwarded: bonus?.amount ?? 0,
        awardedAt: bonus?.awardedAt ?? null,
      };
    });

    return ok({
      referralCode,
      stats: {
        totalReferrals,
        successfulReferrals: totalSuccessful,
        pointsEarned: referralEarningsAgg._sum.amount ?? 0,
      },
      referrals,
    });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/members/referrals error:", e);
    return errors.server("Gagal mengambil data referral");
  }
}
