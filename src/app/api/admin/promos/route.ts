import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { createPromoSchema, type CreatePromoInput } from "@/lib/validations/promo";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/promos?status=active|inactive|expired&search=&page=1
 * Lists all promos for admin management.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const now = new Date();
    const statusFilter: Prisma.PromoWhereInput =
      statusParam === "active"
        ? { isActive: true, startDate: { lte: now }, endDate: { gte: now } }
        : statusParam === "inactive"
          ? { isActive: false }
          : statusParam === "expired"
            ? { endDate: { lt: now } }
            : {};

    const where: Prisma.PromoWhereInput = {
      ...statusFilter,
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [promos, total, summary] = await Promise.all([
      prisma.promo.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.promo.count({ where }),
      prisma.promo.groupBy({
        by: ["isActive"],
        _count: { _all: true },
      }),
    ]);

    let activeTotal = 0;
    let inactiveTotal = 0;
    for (const row of summary) {
      if (row.isActive) activeTotal = row._count._all;
      else inactiveTotal = row._count._all;
    }

    return ok(
      {
        promos,
        stats: {
          active: activeTotal,
          inactive: inactiveTotal,
          total: activeTotal + inactiveTotal,
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
    console.error("GET /api/admin/promos error:", e);
    return errors.server("Gagal memuat promo");
  }
}

/**
 * POST /api/admin/promos
 * Create a new promo. Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createPromoSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as CreatePromoInput;
    const code = data.code.toUpperCase();

    // Check unique code
    const existing = await prisma.promo.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existing) {
      return errors.conflict(`Kode promo "${code}" sudah ada`);
    }

    const promo = await prisma.promo.create({
      data: {
        code,
        title: data.title,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minBooking: data.minBooking ?? null,
        maxDiscount: data.maxDiscount ?? null,
        usageLimit: data.usageLimit ?? null,
        perUserLimit: data.perUserLimit,
        memberOnly: data.memberOnly,
        minTier: data.minTier ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
      },
    });

    return created(promo);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("POST /api/admin/promos error:", e);
    return errors.server("Gagal membuat promo");
  }
}
