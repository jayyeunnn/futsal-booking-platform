import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { getActiveRewards } from "@/lib/rewards";

export const dynamic = "force-dynamic";

/**
 * GET /api/members/rewards
 * Returns the reward catalog plus the current user's:
 *  - totalPoints (for affordability hints)
 *  - active redemptions (unused, not expired)
 */
export async function GET() {
  try {
    const auth = await requireUser();
    const [user, redemptions, catalog] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.id },
        select: { totalPoints: true, tier: true },
      }),
      prisma.redemption.findMany({
        where: {
          userId: auth.id,
          usedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { redeemedAt: "desc" },
      }),
      getActiveRewards(),
    ]);

    if (!user) return errors.notFound("User tidak ditemukan");

    return ok({
      catalog,
      activeRedemptions: redemptions,
      user,
    });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/members/rewards error:", e);
    return errors.server("Gagal memuat reward");
  }
}
