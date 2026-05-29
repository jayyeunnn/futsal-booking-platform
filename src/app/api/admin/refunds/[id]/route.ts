import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";

/**
 * GET /api/admin/refunds/[id]
 * Returns full refund detail with user, booking, court, location, and
 * the originating payment record.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const refund = await prisma.refund.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            tier: true,
          },
        },
        booking: {
          include: {
            court: {
              include: { location: { select: { name: true, address: true } } },
            },
          },
        },
        payment: true,
        processedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!refund) return errors.notFound("Refund tidak ditemukan");

    return ok(refund);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/refunds/[id] error:", e);
    return errors.server("Gagal memuat detail refund");
  }
}
