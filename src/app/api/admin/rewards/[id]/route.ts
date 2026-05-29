import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  updateRewardSchema,
  type UpdateRewardInput,
} from "@/lib/validations/reward";

/**
 * GET /api/admin/rewards/[id]
 * Returns single reward detail for editing.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const reward = await prisma.reward.findUnique({ where: { id: params.id } });
    if (!reward) return errors.notFound("Reward tidak ditemukan");
    return ok(reward);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/rewards/[id] error:", e);
    return errors.server("Gagal memuat reward");
  }
}

/**
 * PUT /api/admin/rewards/[id]
 * Update existing reward. Admin only. Partial update.
 *
 * Note: `code` jangan diubah kalau sudah ada redemption pakai key tsb,
 * karena `Redemption.rewardKey` snapshot — tapi ini di-handle di FE.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = updateRewardSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }

    const existing = await prisma.reward.findUnique({
      where: { id: params.id },
      select: { id: true, code: true },
    });
    if (!existing) return errors.notFound("Reward tidak ditemukan");

    const data = parsed.data as UpdateRewardInput;

    // Code change requires uniqueness check
    if (data.code && data.code.toLowerCase() !== existing.code) {
      const code = data.code.toLowerCase();
      const conflict = await prisma.reward.findUnique({
        where: { code },
        select: { id: true },
      });
      if (conflict && conflict.id !== existing.id) {
        return errors.conflict(`Kode reward "${code}" sudah ada`);
      }
    }

    const updated = await prisma.reward.update({
      where: { id: existing.id },
      data: {
        ...(data.code && { code: data.code.toLowerCase() }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn || null }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.descriptionEn !== undefined && {
          descriptionEn: data.descriptionEn || null,
        }),
        ...(data.pointsCost !== undefined && { pointsCost: data.pointsCost }),
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.validForDays !== undefined && {
          validForDays: data.validForDays,
        }),
        ...(data.minTier !== undefined && { minTier: data.minTier }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/rewards/[id] error:", e);
    return errors.server("Gagal update reward");
  }
}

/**
 * DELETE /api/admin/rewards/[id]
 * Smart delete:
 *   - hard delete kalau belum pernah ada Redemption pakai code-nya
 *   - soft delete (isActive=false) kalau sudah ada history (preserve audit)
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const existing = await prisma.reward.findUnique({
      where: { id: params.id },
      select: { id: true, code: true },
    });
    if (!existing) return errors.notFound("Reward tidak ditemukan");

    const usageCount = await prisma.redemption.count({
      where: { rewardKey: existing.code },
    });

    if (usageCount === 0) {
      await prisma.reward.delete({ where: { id: existing.id } });
      return ok({ deleted: true, mode: "hard" });
    }

    await prisma.reward.update({
      where: { id: existing.id },
      data: { isActive: false },
    });
    return ok({ deleted: true, mode: "soft", usageCount });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/admin/rewards/[id] error:", e);
    return errors.server("Gagal hapus reward");
  }
}
