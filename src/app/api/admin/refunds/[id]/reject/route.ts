import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { sendRefundProcessedEmail } from "@/emails/render";

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Alasan penolakan minimal 5 karakter")
    .max(500),
});

/**
 * PUT /api/admin/refunds/[id]/reject
 * Body: { reason: string }
 *
 * Rejects a refund request with a mandatory reason. Reason is appended
 * to the existing reason field for audit trail.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Alasan wajib diisi"
      );
    }

    const refund = await prisma.refund.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!refund) return errors.notFound("Refund tidak ditemukan");
    if (refund.status !== "REQUESTED") {
      return errors.validation(
        "Refund tidak dalam status REQUESTED, tidak bisa direject"
      );
    }

    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: "REJECTED",
        reason: `${refund.reason}\n\n[Ditolak oleh admin (${admin.email}): ${parsed.data.reason}]`,
        processedById: admin.id,
        processedAt: new Date(),
      },
    });

    void createNotification({
      userId: refund.userId,
      title: "Refund Ditolak",
      message: `Refund kamu ditolak. Alasan: ${parsed.data.reason}`,
      type: "PAYMENT",
      actionUrl: "/dashboard/bookings",
    }).catch((e) => console.error("[refund/reject] notif failed", e));

    void sendRefundProcessedEmail(refund.user.email, {
      userName: refund.user.name,
      refundAmount: Number(refund.amount),
      bankName: refund.bankName ?? "—",
      accountNumber: refund.accountNumber ?? "—",
      status: "REJECTED",
      rejectionReason: parsed.data.reason,
    }).catch((e) => console.error("[refund/reject] email failed", e));

    return ok({ message: "Refund berhasil ditolak" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/refunds/[id]/reject error:", e);
    return errors.server("Gagal reject refund");
  }
}
