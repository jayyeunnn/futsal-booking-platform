import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import { formatDateOnly, parseDateRange } from "@/lib/reports";
import { getMemberReport } from "@/lib/report-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports/members?from=&to=
 *
 * New registrations per day plus running cumulative totals and the current
 * tier distribution snapshot.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const { searchParams } = new URL(request.url);
    const { from, to } = parseDateRange(
      searchParams.get("from"),
      searchParams.get("to")
    );

    const report = await getMemberReport(from, to);
    return ok({
      from: formatDateOnly(from),
      to: formatDateOnly(toInclusive(to)),
      ...report,
    });
  } catch (e) {
    if (isAuthError(e)) {
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    }
    console.error("GET /api/admin/reports/members error:", e);
    return errors.server("Gagal memuat laporan member");
  }
}

function toInclusive(toExclusive: Date): Date {
  const d = new Date(toExclusive);
  d.setDate(d.getDate() - 1);
  return d;
}
