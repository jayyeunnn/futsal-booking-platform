import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { markAsRead } from "@/lib/notifications";

/**
 * PUT /api/notifications/[id]/read
 * Marks a single notification as read for the current user.
 * Idempotent — succeeds even if it's already read or belongs to another user
 * (returns count, doesn't leak existence).
 */
export async function PUT(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser();
    const result = await markAsRead(auth.id, params.id);
    return ok({ updated: result.count });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("PUT /api/notifications/[id]/read error:", e);
    return errors.server("Gagal update notifikasi");
  }
}
