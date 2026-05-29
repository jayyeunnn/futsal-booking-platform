import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { sendRefundProcessedEmail } from "@/emails/render";

/**
 * PUT /api/admin/refunds/[id]/process
 *
 * Marks an APPROVED refund as PROCESSED — i.e. admin has actually transferred
 * the money. Records who did it and when, for audit. Sends a final
 * "money sent" email to the user.
 */
export async function PUT(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);

    const refund = await prisma.refund.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!refund) return errors.notFound("Refund tidak ditemukan");
    if (refund.status !== "APPROVED") {
      return errors.validation(
        "Refund harus sudah APPROVED sebelum bisa ditandai PROCESSED"
      );
    }

    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: "PROCESSED",
        processedById: admin.id,
        processedAt: new Date(),
      },
    });

    void createNotification({
      userId: refund.userId,
      title: "Refund Sudah Ditransfer ✅",
      message: `Refund Rp ${Number(refund.amount).toLocaleString("id-ID")} sudah ditransfer ke ${refund.bankName} ${refund.accountNumber}.`,
      type: "PAYMENT",
      actionUrl: "/dashboard/bookings",
    }).catch((e) => console.error("[refund/process] notif failed", e));

    void sendRefundProcessedEmail(refund.user.email, {
      userName: refund.user.name,
      refundAmount: Number(refund.amount),
      bankName: refund.bankName ?? "—",
      accountNumber: refund.accountNumber ?? "—",
      status: "PROCESSED",
    }).catch((e) => console.error("[refund/process] email failed", e));

    return ok({ message: "Refund ditandai sebagai PROCESSED" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/refunds/[id]/process error:", e);
    return errors.server("Gagal proses refund");
  }
}
