import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import type { NotificationType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_TYPES: NotificationType[] = [
  "BOOKING",
  "PAYMENT",
  "PROMO",
  "MEMBERSHIP",
  "SYSTEM",
];

/**
 * GET /api/notifications?type=BOOKING|PAYMENT|...&unread=1&page=1&limit=20
 * Lists current user's notifications, newest first.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "1";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    const where = {
      userId: auth.id,
      ...(type && VALID_TYPES.includes(type as NotificationType)
        ? { type: type as NotificationType }
        : {}),
      ...(unreadOnly && { isRead: false }),
    };

    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: auth.id, isRead: false },
      }),
    ]);

    return ok(
      { items, unread },
      {
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      }
    );
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/notifications error:", e);
    return errors.server("Gagal mengambil notifikasi");
  }
}
