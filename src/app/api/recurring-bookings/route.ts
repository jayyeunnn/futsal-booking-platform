import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { createRecurringBookingSchema } from "@/lib/validations/recurring-booking";

export const dynamic = "force-dynamic";

/**
 * GET /api/recurring-bookings
 * Returns the user's recurring booking templates with court+location embedded.
 */
export async function GET() {
  try {
    const auth = await requireUser();
    const items = await prisma.recurringBooking.findMany({
      where: { userId: auth.id },
      include: {
        court: {
          include: { location: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(items);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/recurring-bookings error:", e);
    return errors.server("Gagal memuat recurring booking");
  }
}

/**
 * POST /api/recurring-bookings
 * Body: { courtId, dayOfWeek, startTime, endTime, startDate, endDate? }
 *
 * Creates a recurring template. The cron `/api/cron/generate-recurring` will
 * generate concrete `Booking` rows for next week's occurrence each day.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = createRecurringBookingSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }
    const { courtId, dayOfWeek, startTime, endTime, startDate, endDate } =
      parsed.data;

    if (startTime >= endTime) {
      return errors.validation("Jam selesai harus setelah jam mulai");
    }

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { id: true, isActive: true },
    });
    if (!court || !court.isActive) {
      return errors.notFound("Lapangan tidak ditemukan atau nonaktif");
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return errors.validation("Tanggal mulai tidak valid");
    }
    const end = endDate ? new Date(endDate) : null;
    if (end && Number.isNaN(end.getTime())) {
      return errors.validation("Tanggal selesai tidak valid");
    }
    if (end && end <= start) {
      return errors.validation("Tanggal selesai harus setelah tanggal mulai");
    }

    const recurring = await prisma.recurringBooking.create({
      data: {
        userId: auth.id,
        courtId,
        dayOfWeek,
        startTime,
        endTime,
        startDate: start,
        endDate: end,
        isActive: true,
      },
    });

    return created(recurring);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("POST /api/recurring-bookings error:", e);
    return errors.server("Gagal membuat recurring booking");
  }
}
