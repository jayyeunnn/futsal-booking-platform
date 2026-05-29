import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { markAllAsRead } from "@/lib/notifications";

/**
 * PUT /api/notifications/read-all
 * Marks every unread notification for the current user as read.
 */
export async function PUT() {
  try {
    const auth = await requireUser();
    const result = await markAllAsRead(auth.id);
    return ok({ updated: result.count });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("PUT /api/notifications/read-all error:", e);
    return errors.server("Gagal update notifikasi");
  }
}
