import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  updateAdminUserSchema,
  type UpdateAdminUserInput,
} from "@/lib/validations/admin-user";

/**
 * GET /api/admin/users/[id]
 * Detail user untuk edit (admin only).
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        tier: true,
        totalPoints: true,
        totalBookings: true,
        provider: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) return errors.notFound("User tidak ditemukan");
    return ok(user);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/users/[id] error:", e);
    return errors.server("Gagal memuat user");
  }
}

/**
 * PUT /api/admin/users/[id]
 *
 * Update user (admin only). Field yang bisa diubah:
 *   - name, phone (info kontak)
 *   - role (USER → STAFF promotion)
 *   - isActive (deactivate)
 *   - password (admin reset, optional — kosongkan untuk skip)
 *
 * Email + tier tidak bisa diubah dari sini (email butuh re-verify, tier auto via points).
 *
 * Self-protection: admin tidak bisa downgrade dirinya sendiri (ADMIN → STAFF/USER)
 * atau deactivate akun sendiri, supaya tidak terkunci dari sistem.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = updateAdminUserSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });
    if (!target) return errors.notFound("User tidak ditemukan");

    const data = parsed.data as UpdateAdminUserInput;

    // Self-protection
    const isSelfEdit = target.id === admin.id;
    if (isSelfEdit) {
      if (data.role && data.role !== "ADMIN") {
        return errors.validation(
          "Tidak bisa mengubah role akun sendiri (admin self-protection)"
        );
      }
      if (data.isActive === false) {
        return errors.validation(
          "Tidak bisa menonaktifkan akun sendiri"
        );
      }
    }

    // If demoting an ADMIN to non-ADMIN, ensure at least 1 admin remains.
    if (data.role && data.role !== "ADMIN" && target.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (adminCount <= 1) {
        return errors.validation(
          "Tidak bisa demote admin terakhir — minimal harus ada 1 ADMIN aktif"
        );
      }
    }

    // Hash password kalau diisi (admin reset).
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined)
      updateData.phone = data.phone ? data.phone : null;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        tier: true,
        isActive: true,
      },
    });

    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/users/[id] error:", e);
    return errors.server("Gagal update user");
  }
}

/**
 * DELETE /api/admin/users/[id]
 *
 * Soft delete: set isActive=false. Hard delete tidak diizinkan untuk
 * preserve history (booking, refund, points) yang FK ke user ini.
 *
 * Self-protection sama dengan PUT — admin tidak bisa hapus akun sendiri.
 * Last-admin protection juga aktif.
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true, isActive: true },
    });
    if (!target) return errors.notFound("User tidak ditemukan");

    if (target.id === admin.id) {
      return errors.validation("Tidak bisa menonaktifkan akun sendiri");
    }
    if (target.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (activeAdminCount <= 1) {
        return errors.validation(
          "Tidak bisa menonaktifkan admin terakhir"
        );
      }
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { isActive: false },
    });
    return ok({ deactivated: true });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/admin/users/[id] error:", e);
    return errors.server("Gagal nonaktifkan user");
  }
}
