import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { maybeUpgradeTier } from "@/lib/points";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  amount: z
    .number()
    .int()
    .refine((v) => v !== 0, "Jumlah tidak boleh nol")
    .refine((v) => Math.abs(v) <= 10_000, "Jumlah maksimal 10.000 sekali ubah"),
  reason: z.string().trim().min(3, "Alasan minimal 3 karakter").max(255),
});

/**
 * PUT /api/admin/members/[id]/adjust-points
 * Body: { amount: int (positive=earn, negative=deduct), reason: string }
 *
 * Used by admins to manually credit/debit a member's points for goodwill,
 * dispute resolution, or off-system bonuses. Always logged in PointsHistory
 * with type ADMIN_ADJUST and the actor's id stored in `description`.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }
    const { amount, reason } = parsed.data;

    const member = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, totalPoints: true, role: true },
    });
    if (!member) return errors.notFound("Member tidak ditemukan");

    if (member.totalPoints + amount < 0) {
      return errors.validation("Tidak boleh membuat poin minus");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: member.id },
        data: { totalPoints: { increment: amount } },
        select: { totalPoints: true, tier: true, totalBookings: true },
      });
      await tx.pointsHistory.create({
        data: {
          userId: member.id,
          amount,
          type: "ADMIN_ADJUST",
          description: `Admin (${admin.email}): ${reason}`,
        },
      });
      return u;
    });

    // Possible tier upgrade after positive adjustment.
    const newTier = await maybeUpgradeTier(member.id);

    // Notify the member.
    await createNotification({
      userId: member.id,
      title: amount > 0 ? "Poin Bertambah" : "Poin Berkurang",
      message:
        amount > 0
          ? `Admin menambah ${amount} poin: ${reason}`
          : `Admin mengurangi ${Math.abs(amount)} poin: ${reason}`,
      type: "MEMBERSHIP",
      actionUrl: "/dashboard/points",
    });

    return ok({
      totalPoints: updated.totalPoints,
      tier: newTier ?? updated.tier,
      tierUpgraded: Boolean(newTier),
    });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/members/[id]/adjust-points error:", e);
    return errors.server("Gagal adjust poin");
  }
}
