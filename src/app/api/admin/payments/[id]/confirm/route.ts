import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { sendBookingConfirmedEmail } from "@/emails/render";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * PUT /api/admin/payments/[id]/confirm
 * Admin/Staff approves an uploaded payment proof.
 *
 * Side effects:
 *   - payment.status -> CONFIRMED
 *   - booking.status -> CONFIRMED
 *   - In-app notification + email to the customer
 */
export async function PUT(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN", "STAFF"]);

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            court: {
              include: { location: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!payment) return errors.notFound("Pembayaran tidak ditemukan");
    if (payment.status !== "UPLOADED") {
      return errors.validation(
        "Pembayaran tidak dalam status yang bisa dikonfirmasi"
      );
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "CONFIRMED",
          confirmedById: admin.id,
          confirmedAt: new Date(),
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    const formattedDate = format(payment.booking.bookingDate, "EEEE, dd MMMM yyyy", {
      locale: idLocale,
    });

    void createNotification({
      userId: payment.booking.userId,
      title: "Pembayaran Dikonfirmasi ✅",
      message: `Booking di ${payment.booking.court.name} pada ${formattedDate} jam ${payment.booking.startTime} sudah terkonfirmasi.`,
      type: "PAYMENT",
      actionUrl: "/dashboard/bookings",
    }).catch((e) => console.error("[confirm-payment] notif failed", e));

    void sendBookingConfirmedEmail(payment.booking.user.email, {
      userName: payment.booking.user.name,
      bookingId: payment.booking.id,
      courtName: payment.booking.court.name,
      locationName: payment.booking.court.location.name,
      bookingDate: formattedDate,
      startTime: payment.booking.startTime,
      endTime: payment.booking.endTime,
    }).catch((e) => console.error("[confirm-payment] email failed", e));

    return ok({ message: "Pembayaran berhasil dikonfirmasi" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("Confirm payment error:", e);
    return errors.server("Gagal konfirmasi pembayaran");
  }
}
