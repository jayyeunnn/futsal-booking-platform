import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { updateProfileSchema } from "@/lib/validations/profile";

export const dynamic = "force-dynamic";

/**
 * GET /api/members/profile
 * Returns the current user's full member profile, including derived
 * progress metrics for the membership UI.
 */
export async function GET() {
  try {
    const auth = await requireUser();

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        tier: true,
        totalPoints: true,
        totalBookings: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) return errors.notFound("User tidak ditemukan");

    return ok({
      ...user,
      // Frontend-friendly flag — credentials users can change password,
      // OAuth-only users cannot.
      canChangePassword: user.provider === "credentials" || user.provider === null,
    });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/members/profile error:", e);
    return errors.server("Gagal memuat profil");
  }
}

/**
 * PUT /api/members/profile
 * Updates the current user's editable fields: name, phone, avatarUrl.
 * Email + role + tier are intentionally not editable here.
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }

    const { name, phone, avatarUrl } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: auth.id },
      data: {
        name,
        phone: phone === "" ? null : phone ?? null,
        avatarUrl: avatarUrl === "" ? null : avatarUrl ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        tier: true,
      },
    });

    return ok(updated);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("PUT /api/members/profile error:", e);
    return errors.server("Gagal menyimpan profil");
  }
}
