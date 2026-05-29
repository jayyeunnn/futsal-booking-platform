import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews?visibility=visible|hidden|all&search=&page=1
 * Returns all reviews for moderation.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get("visibility") || "all";
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const where: Prisma.ReviewWhereInput = {
      ...(visibility === "visible" && { isVisible: true }),
      ...(visibility === "hidden" && { isVisible: false }),
      ...(search
        ? {
            OR: [
              { comment: { contains: search, mode: "insensitive" } },
              {
                user: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [reviews, total, summary] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, tier: true } },
          court: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    return ok(
      {
        reviews,
        summary: {
          total: summary._count._all,
          avgRating: summary._avg.rating
            ? Number(summary._avg.rating.toFixed(2))
            : 0,
        },
      },
      {
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      }
    );
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/reviews error:", e);
    return errors.server("Gagal memuat review");
  }
}
