import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  createAdminUserSchema,
  type CreateAdminUserInput,
} from "@/lib/validations/admin-user";
import type { Prisma, UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users?role=ADMIN|STAFF|USER&search=&page=1
 *
 * Lists users for admin management. By default shows only STAFF + ADMIN
 * (since users are managed via /admin/members page). Pass `role=USER`
 * untuk include regular users di list yang sama.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    // Default: only show STAFF + ADMIN (admin staff management page).
    const validRoles: UserRole[] = ["USER", "STAFF", "ADMIN"];
    const role = (validRoles as string[]).includes(roleParam ?? "")
      ? (roleParam as UserRole)
      : null;

    const where: Prisma.UserWhereInput = {
      ...(role
        ? { role }
        : { role: { in: ["STAFF", "ADMIN"] } }),
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

    const [users, total, summary] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          tier: true,
          isActive: true,
          provider: true,
          createdAt: true,
        },
        orderBy: [{ role: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

    const counts: Record<UserRole, number> = {
      USER: 0,
      STAFF: 0,
      ADMIN: 0,
    };
    for (const row of summary) counts[row.role] = row._count._all;

    return ok(
      { users, counts },
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
    console.error("GET /api/admin/users error:", e);
    return errors.server("Gagal memuat user");
  }
}

/**
 * POST /api/admin/users
 *
 * Create a new user account (typically STAFF). Bcrypt password yang dikirim
 * sebelum simpan. Role-nya bebas di-set tapi membutuhkan ADMIN role.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createAdminUserSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as CreateAdminUserInput;

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      return errors.conflict(`Email "${data.email}" sudah terdaftar`);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
        role: data.role,
        tier: "BRONZE",
        provider: "credentials",
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        tier: true,
        isActive: true,
        createdAt: true,
      },
    });

    return created(user);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("POST /api/admin/users error:", e);
    return errors.server("Gagal membuat user");
  }
}
