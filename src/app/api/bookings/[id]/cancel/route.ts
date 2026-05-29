import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { bookingStartDate, calculateRefund } from "@/lib/refunds";
import { createNotification } from "@/lib/notifications";
import { sendBookingCancelledEmail } from "@/emails/render";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Alasan pembatalan minimal 5 karakter")
    .max(500),
  /** Optional refund bank info. Required when refund is eligible. */
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
});

/**
 * PUT /api/bookings/[id]/cancel
 *
 * User-initiated cancellation. Behavior depends on current booking status:
 *   - PENDING_PAYMENT / PENDING_CONFIRMATION:
 *       Cancels the booking and any payment. No refund record (nothing was confirmed).
 *   - CONFIRMED:
 *       Cancels the booking, calculates refund eligibility per PRD §3.3.4.
 *       If refund > 0, creates a Refund record (status: REQUESTED) so admin can process it.
 *       Caller MUST provide bankName/accountNumber/accountHolder when refund > 0.
 *   - COMPLETED / CANCELLED / EXPIRED:
 *       Returns 400 — booking is no longer cancellable.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser();
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }
    const { reason, bankName, accountNumber, accountHolder } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        court: { select: { name: true } },
        payments: true,
      },
    });

    if (!booking) return errors.notFound("Booking tidak ditemukan");
    if (booking.userId !== auth.id) return errors.forbidden();

    const cancellable = [
      "PENDING_PAYMENT",
      "PENDING_CONFIRMATION",
      "CONFIRMED",
    ];
    if (!cancellable.includes(booking.status)) {
      return errors.validation(
        "Booking tidak dalam status yang bisa dibatalkan"
      );
    }

    const wasConfirmed = booking.status === "CONFIRMED";
    const paidAmount = booking.payments
      .filter((p) => p.status === "CONFIRMED")
      .reduce((s, p) => s + Number(p.amount), 0);

    const startAt = bookingStartDate(booking.bookingDate, booking.startTime);
    const refund = wasConfirmed
      ? calculateRefund(startAt, paidAmount)
      : null;

    // When refund is eligible, bank details are mandatory.
    if (refund?.eligible) {
      if (!bankName || !accountNumber || !accountHolder) {
        return errors.validation(
          "Detail rekening (bankName, accountNumber, accountHolder) wajib untuk refund."
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      // Mark booking cancelled.
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          cancelReason: reason,
          cancelledAt: new Date(),
        },
      });

      // Mark any pending/uploaded payments as REJECTED so they don't expire-process again.
      await tx.payment.updateMany({
        where: {
          bookingId: booking.id,
          status: { in: ["PENDING", "UPLOADED"] },
        },
        data: { status: "REJECTED" },
      });

      // If refund eligible, create a refund request linked to the most recent
      // confirmed payment.
      if (refund?.eligible) {
        const lastConfirmed = [...booking.payments]
          .filter((p) => p.status === "CONFIRMED")
          .sort(
            (a, b) =>
              b.confirmedAt!.getTime() - a.confirmedAt!.getTime()
          )[0];
        if (lastConfirmed) {
          await tx.refund.create({
            data: {
              paymentId: lastConfirmed.id,
              bookingId: booking.id,
              userId: booking.userId,
              amount: refund.amount,
              refundPercentage: refund.percentage,
              reason,
              bankName,
              accountNumber,
              accountHolder,
              status: "REQUESTED",
            },
          });
        }
      }
    });

    const formattedDate = format(booking.bookingDate, "EEEE, dd MMMM yyyy", {
      locale: idLocale,
    });

    void createNotification({
      userId: booking.userId,
      title: "Booking Dibatalkan",
      message:
        refund?.eligible
          ? `Booking dibatalkan. Refund ${refund.percentage}% (Rp ${refund.amount.toLocaleString("id-ID")}) akan diproses.`
          : "Booking dibatalkan.",
      type: "BOOKING",
      actionUrl: "/dashboard/bookings",
    }).catch((e) => console.error("[cancel] notif failed", e));

    void sendBookingCancelledEmail(booking.user.email, {
      userName: booking.user.name,
      courtName: booking.court.name,
      bookingDate: formattedDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      reason,
      refundEligible: !!refund?.eligible,
      refundAmount: refund?.amount,
    }).catch((e) => console.error("[cancel] email failed", e));

    return ok({
      cancelled: true,
      refund: refund
        ? {
            eligible: refund.eligible,
            percentage: refund.percentage,
            amount: refund.amount,
            reason: refund.reason,
          }
        : null,
    });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/bookings/[id]/cancel error:", e);
    return errors.server("Gagal membatalkan booking");
  }
}
