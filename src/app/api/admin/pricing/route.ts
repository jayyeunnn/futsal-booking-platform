import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing?locationId=xxx&search=
 * Returns all active courts with their current pricing summary,
 * grouped untuk pricing matrix overview.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const search = searchParams.get("search")?.trim();

    const where: Prisma.CourtWhereInput = {
      isActive: true,
      ...(locationId ? { locationId } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : {}),
    };

    const courts = await prisma.court.findMany({
      where,
      include: {
        location: { select: { id: true, name: true } },
        pricing: {
          where: { isActive: true },
          select: {
            dayType: true,
            timeType: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    });

    return ok(courts);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/pricing error:", e);
    return errors.server("Gagal memuat harga");
  }
}
