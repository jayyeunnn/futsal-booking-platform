import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { createReviewSchema } from "@/lib/validations/review";
import { awardPoints, maybeUpgradeTier, POINTS_RULES } from "@/lib/points";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews?courtId=xxx&page=1&limit=20
 * Returns visible reviews for a court with rating distribution & average.
 * Public endpoint — anyone can call this.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    if (!courtId) {
      return errors.validation("courtId wajib diisi");
    }
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const where = { courtId, isVisible: true };

    const [reviews, total, avg, dist] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true, tier: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where,
        _count: { _all: true },
      }),
    ]);

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const r of dist) {
      const k = r.rating as 1 | 2 | 3 | 4 | 5;
      if (k >= 1 && k <= 5) distribution[k] = r._count._all;
    }

    return ok(
      {
        reviews,
        avgRating: avg._avg.rating ? Number(avg._avg.rating.toFixed(2)) : 0,
        totalReviews: avg._count._all,
        distribution,
      },
      {
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      }
    );
  } catch (e) {
    console.error("GET /api/reviews error:", e);
    return errors.server("Gagal memuat review");
  }
}

/**
 * POST /api/reviews
 * Body: { bookingId, rating (1-5), comment? }
 *
 * Submits a review for a completed booking. Constraints:
 *   - User must own the booking.
 *   - Booking.status must be COMPLETED.
 *   - One review per booking (DB unique constraint).
 *
 * On success, awards POINTS_RULES.review (5 pts), idempotent via PointsHistory.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsed.data.bookingId },
      select: {
        id: true,
        userId: true,
        courtId: true,
        status: true,
        review: { select: { id: true } },
      },
    });
    if (!booking) return errors.notFound("Booking tidak ditemukan");
    if (booking.userId !== auth.id) return errors.forbidden();
    if (booking.status !== "COMPLETED") {
      return errors.validation(
        "Review hanya bisa dibuat untuk booking yang sudah selesai"
      );
    }
    if (booking.review) {
      return errors.conflict("Booking ini sudah pernah direview");
    }

    const review = await prisma.review.create({
      data: {
        userId: auth.id,
        courtId: booking.courtId,
        bookingId: booking.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
    });

    // Award review points — best effort, don't fail the request if it errors.
    try {
      await awardPoints({
        userId: auth.id,
        amount: POINTS_RULES.review,
        type: "EARNED_REVIEW",
        description: "Submit review",
        referenceId: review.id,
      });
      await maybeUpgradeTier(auth.id);
    } catch (e) {
      console.error("[reviews] award points failed", e);
    }

    return created(review);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("POST /api/reviews error:", e);
    return errors.server("Gagal mengirim review");
  }
}
