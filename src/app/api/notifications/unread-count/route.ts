import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { getUnreadCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/unread-count
 * Lightweight endpoint for the header bell badge.
 * Returns `{ count: number }`.
 */
export async function GET() {
  try {
    const auth = await requireUser();
    const count = await getUnreadCount(auth.id);
    return ok({ count });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/notifications/unread-count error:", e);
    return errors.server("Gagal mengambil jumlah notifikasi");
  }
}
