import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  bulkUpdatePricingSchema,
  type BulkUpdatePricingInput,
} from "@/lib/validations/pricing";

/**
 * GET /api/admin/pricing/[courtId]
 * Returns all pricing rows for a specific court.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { courtId: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const court = await prisma.court.findUnique({
      where: { id: params.courtId },
      include: {
        location: { select: { name: true } },
        pricing: {
          orderBy: [{ dayType: "asc" }, { timeType: "asc" }],
        },
      },
    });
    if (!court) return errors.notFound("Lapangan tidak ditemukan");

    return ok(court);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/pricing/[courtId] error:", e);
    return errors.server("Gagal memuat harga");
  }
}

/**
 * PUT /api/admin/pricing/[courtId]
 * Body: { rows: PricingRow[] }
 *
 * Replaces all pricing rows for the court atomically — much simpler than
 * tracking individual diffs since PriceMatrix UI sends the full state.
 *
 * Within the transaction:
 *   1. delete all existing pricing for this court
 *   2. insert all rows from request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { courtId: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = bulkUpdatePricingSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as BulkUpdatePricingInput;

    const court = await prisma.court.findUnique({
      where: { id: params.courtId },
      select: { id: true },
    });
    if (!court) return errors.notFound("Lapangan tidak ditemukan");

    // Validate per-row time logic.
    for (const row of data.rows) {
      if (row.startHour >= row.endHour) {
        return errors.validation(
          `Jam akhir harus setelah jam mulai (${row.dayType} ${row.timeType})`
        );
      }
    }

    // Replace strategy — atomic transaction.
    await prisma.$transaction(async (tx) => {
      await tx.pricing.deleteMany({ where: { courtId: court.id } });
      await tx.pricing.createMany({
        data: data.rows.map((row) => ({
          courtId: court.id,
          dayType: row.dayType,
          timeType: row.timeType,
          startHour: row.startHour,
          endHour: row.endHour,
          pricePerHour: row.pricePerHour,
          isActive: row.isActive,
        })),
      });
    });

    const updated = await prisma.pricing.findMany({
      where: { courtId: court.id },
      orderBy: [{ dayType: "asc" }, { timeType: "asc" }],
    });

    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/pricing/[courtId] error:", e);
    return errors.server("Gagal update harga");
  }
}
