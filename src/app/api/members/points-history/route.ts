import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import type { PointsType } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/members/points-history?direction=earned|redeemed|all&page=1&limit=20
 * Returns the user's points ledger with totals.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser();
    const { searchParams } = new URL(request.url);
    const direction = searchParams.get("direction") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const earnedTypes: PointsType[] = [
      "EARNED_BOOKING",
      "EARNED_REVIEW",
      "EARNED_REFERRAL",
      "EARNED_BONUS",
      "ADMIN_ADJUST",
    ];
    const redeemedTypes: PointsType[] = [
      "REDEEMED_DISCOUNT",
      "REDEEMED_FREE_SESSION",
      "REDEEMED_MERCHANDISE",
    ];

    const where = {
      userId: auth.id,
      ...(direction === "earned" && { type: { in: earnedTypes } }),
      ...(direction === "redeemed" && { type: { in: redeemedTypes } }),
    };

    const [history, total, summary] = await Promise.all([
      prisma.pointsHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pointsHistory.count({ where }),
      prisma.pointsHistory.groupBy({
        by: ["type"],
        where: { userId: auth.id },
        _sum: { amount: true },
      }),
    ]);

    let totalEarned = 0;
    let totalRedeemed = 0;
    for (const row of summary) {
      const amount = row._sum.amount ?? 0;
      if (amount > 0) totalEarned += amount;
      else totalRedeemed += amount;
    }

    return ok(
      { history, totalEarned, totalRedeemed: Math.abs(totalRedeemed) },
      {
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      }
    );
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/members/points-history error:", e);
    return errors.server("Gagal mengambil riwayat poin");
  }
}
