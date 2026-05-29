import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";

const schema = z.object({
  isVisible: z.boolean(),
});

/**
 * PUT /api/admin/reviews/[id]
 * Body: { isVisible: boolean }
 *
 * Admin/Staff toggles whether a review is visible publicly.
 * Soft-moderation — preserves the data for appeal/audit.
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
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!review) return errors.notFound("Review tidak ditemukan");

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: { isVisible: parsed.data.isVisible },
    });
    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/reviews/[id] error:", e);
    return errors.server("Gagal update review");
  }
}
