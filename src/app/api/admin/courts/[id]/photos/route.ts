import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";

const schema = z.object({
  photos: z
    .array(z.string().url("URL foto tidak valid"))
    .max(8, "Maksimal 8 foto per lapangan"),
});

/**
 * PUT /api/admin/courts/[id]/photos
 * Body: { photos: string[] }
 *
 * Replaces the court's `photos` JSON array entirely. Supports add, remove,
 * and reorder in one call. Photos are uploaded separately via UploadThing
 * (`courtPhoto` endpoint) — this endpoint just persists the resulting URLs.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }

    const court = await prisma.court.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!court) return errors.notFound("Lapangan tidak ditemukan");

    const updated = await prisma.court.update({
      where: { id: court.id },
      data: { photos: parsed.data.photos },
      select: { id: true, photos: true },
    });
    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/courts/[id]/photos error:", e);
    return errors.server("Gagal update foto lapangan");
  }
}
