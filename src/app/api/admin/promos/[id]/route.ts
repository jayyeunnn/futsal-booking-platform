import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { updatePromoSchema, type UpdatePromoInput } from "@/lib/validations/promo";

/**
 * GET /api/admin/promos/[id]
 * Returns single promo detail for editing.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const promo = await prisma.promo.findUnique({ where: { id: params.id } });
    if (!promo) return errors.notFound("Promo tidak ditemukan");
    return ok(promo);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/promos/[id] error:", e);
    return errors.server("Gagal memuat promo");
  }
}

/**
 * PUT /api/admin/promos/[id]
 * Update existing promo. Admin only. All fields optional (partial update).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = updatePromoSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }

    const existing = await prisma.promo.findUnique({
      where: { id: params.id },
      select: { id: true, code: true },
    });
    if (!existing) return errors.notFound("Promo tidak ditemukan");

    const data = parsed.data as UpdatePromoInput;

    // Code change requires uniqueness check
    if (data.code && data.code.toUpperCase() !== existing.code) {
      const code = data.code.toUpperCase();
      const conflict = await prisma.promo.findUnique({
        where: { code },
        select: { id: true },
      });
      if (conflict && conflict.id !== existing.id) {
        return errors.conflict(`Kode promo "${code}" sudah ada`);
      }
    }

    const updated = await prisma.promo.update({
      where: { id: existing.id },
      data: {
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && {
          discountValue: data.discountValue,
        }),
        ...(data.minBooking !== undefined && { minBooking: data.minBooking }),
        ...(data.maxDiscount !== undefined && {
          maxDiscount: data.maxDiscount,
        }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.perUserLimit !== undefined && {
          perUserLimit: data.perUserLimit,
        }),
        ...(data.memberOnly !== undefined && { memberOnly: data.memberOnly }),
        ...(data.minTier !== undefined && { minTier: data.minTier }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/promos/[id] error:", e);
    return errors.server("Gagal update promo");
  }
}

/**
 * DELETE /api/admin/promos/[id]
 * Soft delete: sets isActive=false. Hard delete kalau usageCount=0
 * (belum pernah dipakai), supaya bisa cleanup typo promos.
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const existing = await prisma.promo.findUnique({
      where: { id: params.id },
      select: { id: true, usageCount: true },
    });
    if (!existing) return errors.notFound("Promo tidak ditemukan");

    if (existing.usageCount === 0) {
      // Never used — safe to hard delete.
      await prisma.promo.delete({ where: { id: existing.id } });
      return ok({ deleted: true, mode: "hard" });
    }

    // Has usage history — soft delete to preserve audit trail.
    await prisma.promo.update({
      where: { id: existing.id },
      data: { isActive: false, endDate: new Date() },
    });
    return ok({ deleted: true, mode: "soft" });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/admin/promos/[id] error:", e);
    return errors.server("Gagal hapus promo");
  }
}
