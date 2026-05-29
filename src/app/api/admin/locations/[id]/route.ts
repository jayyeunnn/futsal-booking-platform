import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  updateLocationSchema,
  type UpdateLocationInput,
} from "@/lib/validations/location";

/**
 * GET /api/admin/locations/[id]
 * Detail location for editing.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        courts: {
          select: { id: true, name: true, type: true, isActive: true },
        },
      },
    });
    if (!location) return errors.notFound("Lokasi tidak ditemukan");
    return ok(location);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/locations/[id] error:", e);
    return errors.server("Gagal memuat lokasi");
  }
}

/**
 * PUT /api/admin/locations/[id]
 * Partial update.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = updateLocationSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const existing = await prisma.location.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) return errors.notFound("Lokasi tidak ditemukan");

    const data = parsed.data as UpdateLocationInput;

    const updated = await prisma.location.update({
      where: { id: existing.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.openTime !== undefined && { openTime: data.openTime }),
        ...(data.closeTime !== undefined && { closeTime: data.closeTime }),
        ...(data.thumbnailUrl !== undefined && {
          thumbnailUrl: data.thumbnailUrl || null,
        }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/locations/[id] error:", e);
    return errors.server("Gagal update lokasi");
  }
}

/**
 * DELETE /api/admin/locations/[id]
 *
 * Soft-delete strategy karena Location punya FK ke Court (cascade delete
 * akan hilangkan history bookings). Sebagai gantinya, set isActive=false
 * dan optionally cascade isActive=false ke semua courts di lokasi ini.
 *
 * Jika lokasi belum punya court, hard delete diizinkan.
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const existing = await prisma.location.findUnique({
      where: { id: params.id },
      include: { _count: { select: { courts: true } } },
    });
    if (!existing) return errors.notFound("Lokasi tidak ditemukan");

    if (existing._count.courts === 0) {
      await prisma.location.delete({ where: { id: existing.id } });
      return ok({ deleted: true, mode: "hard" });
    }

    // Soft delete: nonaktifkan lokasi + semua courts di lokasi ini.
    await prisma.$transaction([
      prisma.location.update({
        where: { id: existing.id },
        data: { isActive: false },
      }),
      prisma.court.updateMany({
        where: { locationId: existing.id },
        data: { isActive: false },
      }),
    ]);

    return ok({ deleted: true, mode: "soft" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/admin/locations/[id] error:", e);
    return errors.server("Gagal hapus lokasi");
  }
}
