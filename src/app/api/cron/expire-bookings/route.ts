import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthorizedCronRequest } from "@/lib/cron";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/expire-bookings
 *
 * Runs every 5 minutes (Vercel Cron). For each PENDING_PAYMENT booking whose
 * payment.expiresAt has passed:
 *   - payment.status -> EXPIRED
 *   - booking.status -> EXPIRED
 *   - In-app notification informing the user
 *
 * Slot becomes available again for other bookings.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return errors.unauthorized("Cron auth required");
  }

  try {
    const now = new Date();

    // Find all due payments still pending.
    const due = await prisma.payment.findMany({
      where: {
        status: { in: ["PENDING", "UPLOADED"] },
        expiresAt: { lte: now },
        booking: { status: "PENDING_PAYMENT" },
      },
      include: {
        booking: {
          include: {
            court: { select: { name: true } },
          },
        },
      },
    });

    let expired = 0;
    for (const p of due) {
      try {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: p.id },
            data: { status: "EXPIRED" },
          }),
          prisma.booking.update({
            where: { id: p.bookingId },
            data: { status: "EXPIRED" },
          }),
        ]);
        expired += 1;

        void createNotification({
          userId: p.booking.userId,
          title: "Booking Hangus",
          message: `Booking di ${p.booking.court.name} hangus karena tidak ada pembayaran dalam batas waktu.`,
          type: "BOOKING",
          actionUrl: "/dashboard/bookings",
        }).catch((e) => console.error("[cron/expire] notif failed", e));
      } catch (e) {
        console.error("[cron/expire-bookings] failed for", p.id, e);
      }
    }

    return ok({ expired, scanned: due.length });
  } catch (e) {
    console.error("GET /api/cron/expire-bookings error:", e);
    return errors.server("Cron job gagal");
  }
}
