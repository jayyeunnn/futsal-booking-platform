import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import type { Prisma, RefundStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUS: RefundStatus[] = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PROCESSED",
];

/**
 * GET /api/admin/refunds?status=&search=&page=1&limit=20
 *
 * Lists all refund requests with optional status filter and free-text search
 * over user name/email and booking ID.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam && (VALID_STATUS as string[]).includes(statusParam)
      ? (statusParam as RefundStatus)
      : null;
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const where: Prisma.RefundWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                user: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
              { bookingId: { contains: search } },
              { id: { contains: search } },
            ],
          }
        : {}),
    };

    const [refunds, total, summary] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          booking: {
            include: {
              court: {
                include: { location: { select: { name: true } } },
              },
            },
          },
          payment: { select: { id: true, paymentMethod: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.refund.count({ where }),
      prisma.refund.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const statusCounts: Record<RefundStatus, number> = {
      REQUESTED: 0,
      APPROVED: 0,
      REJECTED: 0,
      PROCESSED: 0,
    };
    for (const row of summary) {
      statusCounts[row.status] = row._count._all;
    }

    return ok(
      { refunds, statusCounts },
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
    console.error("GET /api/admin/refunds error:", e);
    return errors.server("Gagal memuat data refund");
  }
}
