import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { bookingStartDate, calculateRefund } from "@/lib/refunds";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/[id]
 *
 * Returns booking detail visible to the owner (or admin/staff).
 * Includes payments + court + location + refunds + a refund preview if the
 * booking is currently CONFIRMED.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        court: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                phone: true,
              },
            },
          },
        },
        payments: { orderBy: { createdAt: "desc" } },
        refunds: { orderBy: { createdAt: "desc" } },
        review: true,
      },
    });

    if (!booking) return errors.notFound("Booking tidak ditemukan");

    const isOwner = booking.userId === auth.id;
    const isStaff = auth.role === "ADMIN" || auth.role === "STAFF";
    if (!isOwner && !isStaff) return errors.forbidden();

    // Refund preview if cancellation could still happen.
    let refundPreview = null;
    if (booking.status === "CONFIRMED") {
      const paid = booking.payments
        .filter((p) => p.status === "CONFIRMED")
        .reduce((s, p) => s + Number(p.amount), 0);
      const startAt = bookingStartDate(booking.bookingDate, booking.startTime);
      refundPreview = calculateRefund(startAt, paid);
    }

    return ok({ ...booking, refundPreview });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/bookings/[id] error:", e);
    return errors.server("Gagal memuat booking");
  }
}
