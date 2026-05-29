import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { sendBookingCancelledEmail } from "@/emails/render";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * PUT /api/admin/payments/[id]/reject
 * Admin/Staff rejects an uploaded payment proof.
 *
 * Side effects:
 *   - payment.status -> REJECTED
 *   - booking.status -> CANCELLED (with reason)
 *   - In-app notification + email to the customer
 *
 * No refund is auto-issued because the booking was never confirmed.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const body = await request.json().catch(() => ({}));
    const reason: string =
      typeof body?.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : "Bukti transfer tidak valid";

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            court: { select: { name: true } },
          },
        },
      },
    });

    if (!payment) return errors.notFound("Pembayaran tidak ditemukan");
    if (payment.status !== "UPLOADED") {
      return errors.validation(
        "Pembayaran tidak dalam status yang bisa ditolak"
      );
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: params.id },
        data: { status: "REJECTED", notes: reason },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: "CANCELLED",
          cancelReason: `Pembayaran ditolak: ${reason}`,
          cancelledAt: new Date(),
        },
      }),
    ]);

    const formattedDate = format(payment.booking.bookingDate, "EEEE, dd MMMM yyyy", {
      locale: idLocale,
    });

    void createNotification({
      userId: payment.booking.userId,
      title: "Pembayaran Ditolak",
      message: `Pembayaran ditolak: ${reason}. Booking dibatalkan.`,
      type: "PAYMENT",
      actionUrl: "/dashboard/bookings",
    }).catch((e) => console.error("[reject-payment] notif failed", e));

    void sendBookingCancelledEmail(payment.booking.user.email, {
      userName: payment.booking.user.name,
      courtName: payment.booking.court.name,
      bookingDate: formattedDate,
      startTime: payment.booking.startTime,
      endTime: payment.booking.endTime,
      reason: `Pembayaran ditolak: ${reason}`,
      // No refund — payment was never confirmed.
      refundEligible: false,
    }).catch((e) => console.error("[reject-payment] email failed", e));

    return ok({ message: "Pembayaran berhasil ditolak" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("Reject payment error:", e);
    return errors.server("Gagal menolak pembayaran");
  }
}
