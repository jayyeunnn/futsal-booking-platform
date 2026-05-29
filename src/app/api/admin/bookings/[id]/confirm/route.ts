import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";

/**
 * PUT /api/admin/bookings/[id]/confirm
 *
 * Manually confirm a booking. Used for edge cases where admin wants to
 * skip payment validation (e.g. walk-in customer paying cash on-site).
 *
 * Most bookings get CONFIRMED automatically via the payment confirm endpoint.
 */
export async function PUT(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        court: { select: { name: true } },
        user: { select: { id: true } },
      },
    });
    if (!booking) return errors.notFound("Booking tidak ditemukan");

    const allowed = ["PENDING_PAYMENT", "PENDING_CONFIRMATION"];
    if (!allowed.includes(booking.status)) {
      return errors.validation(
        "Booking tidak dalam status yang bisa dikonfirmasi"
      );
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });

    void createNotification({
      userId: booking.userId,
      title: "Booking Dikonfirmasi ✅",
      message: `Admin telah mengkonfirmasi booking di ${booking.court.name}.`,
      type: "BOOKING",
      actionUrl: `/dashboard/bookings/${booking.id}`,
    }).catch((e) => console.error("[admin/confirm-booking] notif failed", e));

    return ok({ message: "Booking dikonfirmasi" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/bookings/[id]/confirm error:", e);
    return errors.server("Gagal konfirmasi booking");
  }
}
