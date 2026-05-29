import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { awardPoints, POINTS_RULES } from "@/lib/points";

/**
 * DELETE /api/reviews/[id]
 *
 * Owner can delete their own review. Reverts the +5 review points by recording
 * a -5 ADMIN_ADJUST entry, so the points ledger stays balanced and auditable.
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser();
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    });
    if (!review) return errors.notFound("Review tidak ditemukan");
    if (review.userId !== auth.id) return errors.forbidden();

    await prisma.review.delete({ where: { id: review.id } });

    // Reverse the points awarded for this review (if any).
    const earned = await prisma.pointsHistory.findFirst({
      where: {
        userId: auth.id,
        type: "EARNED_REVIEW",
        referenceId: review.id,
      },
      select: { id: true, amount: true },
    });
    if (earned) {
      try {
        await awardPoints({
          userId: auth.id,
          amount: -Math.min(earned.amount, POINTS_RULES.review),
          type: "ADMIN_ADJUST",
          description: `Reversal: review ${review.id} dihapus`,
          referenceId: review.id,
        });
      } catch (e) {
        console.error("[reviews/delete] reversal failed", e);
      }
    }

    return ok({ deleted: true });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/reviews/[id] error:", e);
    return errors.server("Gagal menghapus review");
  }
}
