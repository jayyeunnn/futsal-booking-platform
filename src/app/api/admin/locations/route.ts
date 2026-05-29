import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  createLocationSchema,
  type CreateLocationInput,
} from "@/lib/validations/location";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/locations?status=active|inactive&search=&page=1
 * Lists ALL locations (including inactive) for admin management.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const where: Prisma.LocationWhereInput = {
      ...(status === "active" ? { isActive: true } : {}),
      ...(status === "inactive" ? { isActive: false } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: {
          courts: { where: { isActive: true }, select: { id: true, type: true } },
        },
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.location.count({ where }),
    ]);

    return ok(locations, {
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/locations error:", e);
    return errors.server("Gagal memuat lokasi");
  }
}

/**
 * POST /api/admin/locations
 * Create a new location. Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createLocationSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as CreateLocationInput;

    const location = await prisma.location.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone || null,
        email: data.email || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        openTime: data.openTime,
        closeTime: data.closeTime,
        thumbnailUrl: data.thumbnailUrl || null,
        description: data.description || null,
        isActive: data.isActive,
      },
    });

    return created(location);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("POST /api/admin/locations error:", e);
    return errors.server("Gagal membuat lokasi");
  }
}
