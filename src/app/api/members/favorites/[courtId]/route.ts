import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";

/**
 * DELETE /api/members/favorites/[courtId]
 * Removes a court from the user's favorites. Idempotent.
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { courtId: string } }
) {
  try {
    const auth = await requireUser();
    const result = await prisma.favorite.deleteMany({
      where: { userId: auth.id, courtId: params.courtId },
    });
    return ok({ deleted: result.count });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("DELETE /api/members/favorites/[courtId] error:", e);
    return errors.server("Gagal menghapus favorit");
  }
}
