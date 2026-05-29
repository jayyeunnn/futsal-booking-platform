import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { generateRedemptionCode, getReward } from "@/lib/rewards";

const schema = z.object({
  rewardKey: z.string().min(1),
});

/**
 * POST /api/members/redeem
 * Body: { rewardKey: string }
 *
 * Atomically:
 *   1. Verifies user has enough points.
 *   2. Decrements user.totalPoints by reward.pointsCost.
 *   3. Logs PointsHistory (REDEEMED_*).
 *   4. Creates a Redemption row with a unique discount code (where applicable).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Reward tidak valid"
      );
    }

    const reward = await getReward(parsed.data.rewardKey);
    if (!reward) return errors.notFound("Reward tidak ditemukan");

    // Map reward kind -> PointsHistory type.
    const historyType =
      reward.kind === "discount"
        ? "REDEEMED_DISCOUNT"
        : reward.kind === "free_session"
          ? "REDEEMED_FREE_SESSION"
          : "REDEEMED_MERCHANDISE";

    const expiresAt = new Date(
      Date.now() + reward.validForDays * 24 * 60 * 60 * 1000
    );

    const redemption = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: auth.id },
        select: { totalPoints: true, tier: true },
      });
      if (!user) throw new Error("USER_NOT_FOUND");

      if (reward.minTier) {
        const order = { BRONZE: 0, SILVER: 1, GOLD: 2 } as const;
        if (order[user.tier] < order[reward.minTier]) {
          throw new Error("TIER_INSUFFICIENT");
        }
      }
      if (user.totalPoints < reward.pointsCost) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      // Generate a unique discount code; retry on collision.
      let code: string | null = null;
      if (reward.kind !== "merchandise") {
        for (let i = 0; i < 5; i++) {
          const candidate = generateRedemptionCode();
          const exists = await tx.redemption.findUnique({
            where: { discountCode: candidate },
            select: { id: true },
          });
          if (!exists) {
            code = candidate;
            break;
          }
        }
        if (!code) throw new Error("CODE_GENERATION_FAILED");
      }

      const updatedUser = await tx.user.update({
        where: { id: auth.id },
        data: { totalPoints: { decrement: reward.pointsCost } },
        select: { totalPoints: true },
      });

      const created = await tx.redemption.create({
        data: {
          userId: auth.id,
          rewardKey: reward.key,
          rewardName: reward.name,
          pointsSpent: reward.pointsCost,
          discountCode: code,
          discountPct: reward.discountPct ?? null,
          discountAmount: reward.discountAmount ?? null,
          freeHours: reward.freeHours ?? null,
          expiresAt,
        },
      });

      await tx.pointsHistory.create({
        data: {
          userId: auth.id,
          amount: -reward.pointsCost,
          type: historyType,
          description: `Tukar: ${reward.name}`,
          referenceId: created.id,
        },
      });

      return { redemption: created, totalPoints: updatedUser.totalPoints };
    });

    return ok(redemption);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    if (e instanceof Error) {
      if (e.message === "INSUFFICIENT_POINTS")
        return errors.validation("Poin tidak mencukupi");
      if (e.message === "TIER_INSUFFICIENT")
        return errors.validation("Tier kamu belum memenuhi syarat reward ini");
      if (e.message === "USER_NOT_FOUND")
        return errors.notFound("User tidak ditemukan");
      if (e.message === "CODE_GENERATION_FAILED")
        return errors.server("Gagal generate kode reward, silakan coba lagi");
    }
    console.error("POST /api/members/redeem error:", e);
    return errors.server("Gagal menukar reward");
  }
}
