import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/refunds?page=1&limit=20
 *
 * Returns the current user's own refund history. Used by the user-side
 * booking detail / future refund history widget.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const [items, total] = await Promise.all([
      prisma.refund.findMany({
        where: { userId: auth.id },
        include: {
          booking: {
            include: {
              court: {
                include: { location: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.refund.count({ where: { userId: auth.id } }),
    ]);

    return ok(items, {
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/refunds error:", e);
    return errors.server("Gagal memuat refund");
  }
}
