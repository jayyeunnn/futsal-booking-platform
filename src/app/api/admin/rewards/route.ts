import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  createRewardSchema,
  type CreateRewardInput,
} from "@/lib/validations/reward";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/rewards?status=active|inactive&search=&page=1
 * Lists reward catalog for admin management.
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

    const statusFilter: Prisma.RewardWhereInput =
      statusParam === "active"
        ? { isActive: true }
        : statusParam === "inactive"
          ? { isActive: false }
          : {};

    const where: Prisma.RewardWhereInput = {
      ...statusFilter,
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [rewards, total, summary] = await Promise.all([
      prisma.reward.findMany({
        where,
        orderBy: [
          { isActive: "desc" },
          { sortOrder: "asc" },
          { pointsCost: "asc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reward.count({ where }),
      prisma.reward.groupBy({
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
        rewards,
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
    console.error("GET /api/admin/rewards error:", e);
    return errors.server("Gagal memuat reward catalog");
  }
}

/**
 * POST /api/admin/rewards
 * Create a new reward. Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createRewardSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as CreateRewardInput;
    const code = data.code.toLowerCase();

    const existing = await prisma.reward.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existing) {
      return errors.conflict(`Kode reward "${code}" sudah ada`);
    }

    const reward = await prisma.reward.create({
      data: {
        code,
        name: data.name,
        nameEn: data.nameEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        pointsCost: data.pointsCost,
        type: data.type,
        value: data.value,
        validForDays: data.validForDays,
        minTier: data.minTier ?? null,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return created(reward);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("POST /api/admin/rewards error:", e);
    return errors.server("Gagal membuat reward");
  }
}
