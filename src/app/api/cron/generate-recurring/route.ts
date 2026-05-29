import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthorizedCronRequest } from "@/lib/cron";
import { createNotification } from "@/lib/notifications";
import { getMemberDiscountPct } from "@/lib/rewards";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/generate-recurring
 *
 * Runs daily at 00:01 WIB. For each active RecurringBooking template, generate
 * a concrete Booking row for the next matching weekday within a 7-day lookahead
 * window — but only when:
 *   1. The recurring template is active and inside its [startDate, endDate?] window.
 *   2. No booking already exists for the user/court/date/time slot
 *      (prevents duplicates if the cron runs more than once a day).
 *   3. There's no conflicting non-cancelled booking for that court+slot
 *      (someone else booked the same slot manually).
 *
 * Generated bookings start in PENDING_PAYMENT with a 1-hour deadline, same as
 * a manual booking. The user gets an in-app notification asking them to pay.
 *
 * Idempotent — safe to re-run.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return errors.unauthorized("Cron auth required");
  }

  try {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const lookaheadEnd = new Date(start);
    lookaheadEnd.setDate(lookaheadEnd.getDate() + 7);

    const templates = await prisma.recurringBooking.findMany({
      where: {
        isActive: true,
        startDate: { lte: lookaheadEnd },
        OR: [{ endDate: null }, { endDate: { gte: start } }],
      },
      include: {
        court: {
          include: {
            pricing: { where: { isActive: true } },
            location: { select: { name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true, tier: true } },
      },
    });

    let generated = 0;
    let skippedConflict = 0;
    let skippedExisting = 0;
    const errorIds: string[] = [];

    for (const tpl of templates) {
      try {
        // Find the next date matching dayOfWeek within the lookahead window.
        const targetDate = nextOccurrenceWithin(
          tpl.dayOfWeek,
          tpl.startDate,
          tpl.endDate,
          start,
          lookaheadEnd
        );
        if (!targetDate) continue;

        // Skip if already generated for this template+date.
        const alreadyGenerated = await prisma.booking.findFirst({
          where: {
            recurringId: tpl.id,
            bookingDate: targetDate,
          },
          select: { id: true },
        });
        if (alreadyGenerated) {
          skippedExisting += 1;
          continue;
        }

        // Skip if some other (manual) non-cancelled booking conflicts.
        const conflict = await findConflict(
          tpl.courtId,
          targetDate,
          tpl.startTime,
          tpl.endTime
        );
        if (conflict) {
          skippedConflict += 1;
          // Notify user that this week's slot couldn't be auto-created.
          void createNotification({
            userId: tpl.userId,
            title: "Slot Recurring Bentrok",
            message: `Slot ${tpl.startTime} di ${tpl.court.name} pada ${format(targetDate, "EEE, dd MMM", { locale: idLocale })} sudah terbooked. Sesi ini dilewati.`,
            type: "BOOKING",
            actionUrl: "/dashboard/recurring",
          }).catch(() => {});
          continue;
        }

        // Compute price using the same rules as POST /api/bookings.
        const startHour = parseInt(tpl.startTime.split(":")[0], 10) || 0;
        const endHour = parseInt(tpl.endTime.split(":")[0], 10) || 0;
        const durationHours = endHour - startHour;
        if (durationHours <= 0) continue;

        const isWeekend =
          targetDate.getDay() === 0 || targetDate.getDay() === 6;
        const dayType = isWeekend ? "WEEKEND" : "WEEKDAY";
        let subtotal = 0;
        for (let h = startHour; h < endHour; h++) {
          const timeType = h >= 16 ? "PRIME_TIME" : "REGULAR";
          const pricing = tpl.court.pricing.find(
            (p) => p.dayType === dayType && p.timeType === timeType
          );
          subtotal += pricing ? Number(pricing.pricePerHour) : 0;
        }
        const discountPct = getMemberDiscountPct(tpl.user.tier);
        const memberDiscount =
          discountPct > 0 ? Math.ceil((subtotal * discountPct) / 100) : 0;
        const totalPrice = subtotal - memberDiscount;
        const dpAmount = Math.ceil(totalPrice * 0.5);
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

        await prisma.$transaction(async (tx) => {
          const booking = await tx.booking.create({
            data: {
              userId: tpl.userId,
              courtId: tpl.courtId,
              bookingDate: targetDate,
              startTime: tpl.startTime,
              endTime: tpl.endTime,
              durationHours,
              totalPrice,
              dpAmount,
              paymentType: "DP",
              status: "PENDING_PAYMENT",
              isRecurring: true,
              recurringId: tpl.id,
              notes: "Auto-generated dari recurring booking",
            },
          });
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: dpAmount,
              paymentMethod: "PENDING",
              paymentType: "DP",
              status: "PENDING",
              expiresAt,
            },
          });
        });

        generated += 1;
        void createNotification({
          userId: tpl.userId,
          title: "Booking Recurring Dibuat",
          message: `Booking untuk ${format(targetDate, "EEE, dd MMM", { locale: idLocale })} jam ${tpl.startTime} di ${tpl.court.name} sudah dibuat. Selesaikan pembayaran dalam 1 jam.`,
          type: "BOOKING",
          actionUrl: "/dashboard/bookings",
        }).catch(() => {});
      } catch (e) {
        console.error("[cron/generate-recurring] failed for", tpl.id, e);
        errorIds.push(tpl.id);
      }
    }

    return ok({
      scanned: templates.length,
      generated,
      skippedExisting,
      skippedConflict,
      errors: errorIds,
    });
  } catch (e) {
    console.error("GET /api/cron/generate-recurring error:", e);
    return errors.server("Cron job gagal");
  }
}

/**
 * Find the first date >= `from` matching `dayOfWeek` (0-6) that is within
 * the recurring window [startDate, endDate?]. Returns null if no match
 * within `to`.
 */
function nextOccurrenceWithin(
  dayOfWeek: number,
  startDate: Date,
  endDate: Date | null,
  from: Date,
  to: Date
): Date | null {
  // Walk forward day by day in the lookahead window — small, simple, correct.
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  while (cursor < to) {
    if (
      cursor.getDay() === dayOfWeek &&
      cursor >= startDate &&
      (!endDate || cursor <= endDate)
    ) {
      return new Date(cursor);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

/**
 * Returns a booking that conflicts with the proposed slot, ignoring
 * cancelled/expired ones. Same overlap rule as POST /api/bookings.
 */
async function findConflict(
  courtId: string,
  bookingDate: Date,
  startTime: string,
  endTime: string
) {
  const where: Prisma.BookingWhereInput = {
    courtId,
    bookingDate,
    status: { notIn: ["CANCELLED", "EXPIRED"] },
    OR: [
      {
        AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
      },
      {
        AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
      },
      {
        AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
      },
    ],
  };
  return prisma.booking.findFirst({ where, select: { id: true } });
}
