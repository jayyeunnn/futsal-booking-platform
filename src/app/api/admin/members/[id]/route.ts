import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";

/**
 * GET /api/admin/members/[id]
 * Returns full member detail + recent points history + redemption history.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const [member, pointsHistory, redemptions, bookingCount] = await Promise.all([
      prisma.user.findUnique({
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
      }),
      prisma.pointsHistory.findMany({
        where: { userId: params.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.redemption.findMany({
        where: { userId: params.id },
        orderBy: { redeemedAt: "desc" },
        take: 20,
      }),
      prisma.booking.count({
        where: { userId: params.id, status: "COMPLETED" },
      }),
    ]);

    if (!member) return errors.notFound("Member tidak ditemukan");

    return ok({
      member,
      pointsHistory,
      redemptions,
      completedBookings: bookingCount,
    });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/members/[id] error:", e);
    return errors.server("Gagal memuat detail member");
  }
}
