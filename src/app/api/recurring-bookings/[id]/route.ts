import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { updateRecurringBookingSchema } from "@/lib/validations/recurring-booking";

/**
 * PUT /api/recurring-bookings/[id]
 * Body: { isActive?: boolean, endDate?: string | null }
 * Pause/resume or set an end date for the recurring template.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = updateRecurringBookingSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }

    const existing = await prisma.recurringBooking.findUnique({
      where: { id: params.id },
      select: { userId: true, startDate: true },
    });
    if (!existing) return errors.notFound("Recurring booking tidak ditemukan");
    if (existing.userId !== auth.id) return errors.forbidden();

    let endDate: Date | null | undefined;
    if (parsed.data.endDate === null) {
      endDate = null;
    } else if (parsed.data.endDate) {
      const parsedDate = new Date(parsed.data.endDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return errors.validation("Tanggal selesai tidak valid");
      }
      if (parsedDate <= existing.startDate) {
        return errors.validation("Tanggal selesai harus setelah tanggal mulai");
      }
      endDate = parsedDate;
    }

    const updated = await prisma.recurringBooking.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(endDate !== undefined && { endDate }),
      },
    });

    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/recurring-bookings/[id] error:", e);
    return errors.server("Gagal update recurring booking");
  }
}

/**
 * DELETE /api/recurring-bookings/[id]
 *
 * Cancels the recurring template. Generated bookings already in the future
 * are NOT auto-cancelled — user can cancel them individually if needed.
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser();
    const existing = await prisma.recurringBooking.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });
    if (!existing) return errors.notFound("Recurring booking tidak ditemukan");
    if (existing.userId !== auth.id) return errors.forbidden();

    await prisma.recurringBooking.update({
      where: { id: params.id },
      data: { isActive: false, endDate: new Date() },
    });

    return ok({ message: "Recurring booking dibatalkan" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/recurring-bookings/[id] error:", e);
    return errors.server("Gagal cancel recurring booking");
  }
}
