import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthorizedCronRequest } from "@/lib/cron";
import { createNotification } from "@/lib/notifications";
import { sendBookingReminderEmail } from "@/emails/render";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/booking-reminders
 *
 * Runs daily at 18:00 WIB (= 11:00 UTC). Finds CONFIRMED bookings whose
 * date is tomorrow and sends an in-app notification + email reminder.
 *
 * Idempotency: tracked via Notification body uniqueness — we look up
 * existing reminder notifications for the booking before creating new.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return errors.unauthorized("Cron auth required");
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        bookingDate: { gte: tomorrow, lt: dayAfter },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        court: {
          include: {
            location: { select: { name: true, address: true } },
          },
        },
      },
    });

    let sent = 0;
    let skipped = 0;
    for (const b of bookings) {
      // Idempotency check: don't double-send within the same day.
      const existing = await prisma.notification.findFirst({
        where: {
          userId: b.userId,
          type: "BOOKING",
          title: "Reminder: Main Futsal Besok",
          createdAt: { gte: new Date(now.getTime() - 23 * 60 * 60 * 1000) },
          actionUrl: { contains: b.id },
        },
        select: { id: true },
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      const formattedDate = format(b.bookingDate, "EEEE, dd MMMM yyyy", {
        locale: idLocale,
      });

      try {
        await createNotification({
          userId: b.userId,
          title: "Reminder: Main Futsal Besok",
          message: `Jangan lupa, besok ${formattedDate} jam ${b.startTime} di ${b.court.name}, ${b.court.location.name}.`,
          type: "BOOKING",
          actionUrl: `/dashboard/bookings?ref=${b.id}`,
        });
        await sendBookingReminderEmail(b.user.email, {
          userName: b.user.name,
          courtName: b.court.name,
          locationName: b.court.location.name,
          locationAddress: b.court.location.address,
          bookingDate: formattedDate,
          startTime: b.startTime,
          endTime: b.endTime,
        });
        sent += 1;
      } catch (e) {
        console.error("[cron/booking-reminders] failed for", b.id, e);
      }
    }

    return ok({ sent, skipped, totalScanned: bookings.length });
  } catch (e) {
    console.error("GET /api/cron/booking-reminders error:", e);
    return errors.server("Cron job gagal");
  }
}
