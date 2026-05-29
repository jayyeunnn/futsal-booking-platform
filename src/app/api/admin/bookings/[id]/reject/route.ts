import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Alasan minimal 3 karakter")
    .max(500),
});

/**
 * PUT /api/admin/bookings/[id]/reject
 * Body: { reason: string }
 *
 * Manually reject a booking. Sets status to CANCELLED with the given reason.
 * Any pending/uploaded payments are also marked REJECTED.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Alasan wajib diisi"
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        court: { select: { name: true } },
      },
    });
    if (!booking) return errors.notFound("Booking tidak ditemukan");

    const cancellable = ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"];
    if (!cancellable.includes(booking.status)) {
      return errors.validation("Booking tidak dalam status yang bisa direject");
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          cancelReason: parsed.data.reason,
          cancelledAt: new Date(),
        },
      }),
      prisma.payment.updateMany({
        where: {
          bookingId: booking.id,
          status: { in: ["PENDING", "UPLOADED"] },
        },
        data: { status: "REJECTED" },
      }),
    ]);

    void createNotification({
      userId: booking.userId,
      title: "Booking Ditolak",
      message: `Booking di ${booking.court.name} ditolak. Alasan: ${parsed.data.reason}`,
      type: "BOOKING",
      actionUrl: `/dashboard/bookings/${booking.id}`,
    }).catch((e) => console.error("[admin/reject-booking] notif failed", e));

    return ok({ message: "Booking direject" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/bookings/[id]/reject error:", e);
    return errors.server("Gagal reject booking");
  }
}
