import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthorizedCronRequest } from "@/lib/cron";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/cleanup-notifications
 *
 * Runs weekly. Deletes read notifications older than 30 days. Unread ones
 * are kept regardless of age so the user never loses signal.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return errors.unauthorized("Cron auth required");
  }

  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: cutoff },
      },
    });
    return ok({ deleted: result.count, cutoff: cutoff.toISOString() });
  } catch (e) {
    console.error("GET /api/cron/cleanup-notifications error:", e);
    return errors.server("Cron job gagal");
  }
}
