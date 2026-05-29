import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { sendRefundProcessedEmail } from "@/emails/render";

/**
 * PUT /api/admin/refunds/[id]/approve
 *
 * Transitions a refund from REQUESTED to APPROVED. The transfer itself is
 * still manual — admin marks it PROCESSED later via /process.
 */
export async function PUT(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);

    const refund = await prisma.refund.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!refund) return errors.notFound("Refund tidak ditemukan");
    if (refund.status !== "REQUESTED") {
      return errors.validation(
        "Refund tidak dalam status REQUESTED, tidak bisa di-approve"
      );
    }

    await prisma.refund.update({
      where: { id: refund.id },
      data: { status: "APPROVED" },
    });

    void createNotification({
      userId: refund.userId,
      title: "Refund Disetujui",
      message: `Refund kamu sebesar Rp ${Number(refund.amount).toLocaleString("id-ID")} disetujui dan akan diproses transfer.`,
      type: "PAYMENT",
      actionUrl: "/dashboard/bookings",
    }).catch((e) => console.error("[refund/approve] notif failed", e));

    void sendRefundProcessedEmail(refund.user.email, {
      userName: refund.user.name,
      refundAmount: Number(refund.amount),
      bankName: refund.bankName ?? "—",
      accountNumber: refund.accountNumber ?? "—",
      status: "APPROVED",
      estimatedDate: "1-3 hari kerja",
    }).catch((e) => console.error("[refund/approve] email failed", e));

    return ok({ message: "Refund berhasil di-approve" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/refunds/[id]/approve error:", e);
    return errors.server("Gagal approve refund");
  }
}
