import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/members?search=&tier=BRONZE|SILVER|GOLD|ALL&page=1&limit=20
 * Lists members (role=USER) with optional tier and text filters.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const tier = searchParams.get("tier");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const where: Prisma.UserWhereInput = {
      role: "USER",
      ...(tier && tier !== "ALL"
        ? { tier: tier as "BRONZE" | "SILVER" | "GOLD" }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          tier: true,
          totalPoints: true,
          totalBookings: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return ok(members, {
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/members error:", e);
    return errors.server("Gagal memuat data member");
  }
}
