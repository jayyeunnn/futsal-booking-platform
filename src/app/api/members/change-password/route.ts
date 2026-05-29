import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { changePasswordSchema } from "@/lib/validations/profile";

/**
 * POST /api/members/change-password
 * Verifies the current password (bcrypt), then updates to the new one.
 * OAuth-only users (no passwordHash) get a 400 — they should manage
 * their password through the OAuth provider.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, passwordHash: true },
    });
    if (!user) return errors.notFound("User tidak ditemukan");

    if (!user.passwordHash) {
      return errors.validation(
        "Akun ini login lewat penyedia eksternal, tidak bisa ubah password di sini."
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return errors.validation("Password lama salah");
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return ok({ message: "Password berhasil diubah" });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("POST /api/members/change-password error:", e);
    return errors.server("Gagal mengubah password");
  }
}
