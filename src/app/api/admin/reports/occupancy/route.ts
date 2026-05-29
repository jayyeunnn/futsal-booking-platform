import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  formatDateOnly,
  OPERATING_HOURS_PER_DAY,
  parseDateRange,
} from "@/lib/reports";
import { getOccupancyReport } from "@/lib/report-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports/occupancy?from=&to=&courtId=
 *
 * Daily occupancy plus per-court breakdown. `courtId` is optional and scopes
 * the query to a single court when provided.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId")?.trim() || null;
    const { from, to } = parseDateRange(
      searchParams.get("from"),
      searchParams.get("to")
    );

    const report = await getOccupancyReport(from, to, courtId);
    return ok({
      from: formatDateOnly(from),
      to: formatDateOnly(toInclusive(to)),
      operatingHoursPerDay: OPERATING_HOURS_PER_DAY,
      ...report,
    });
  } catch (e) {
    if (isAuthError(e)) {
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    }
    console.error("GET /api/admin/reports/occupancy error:", e);
    return errors.server("Gagal memuat laporan occupancy");
  }
}

function toInclusive(toExclusive: Date): Date {
  const d = new Date(toExclusive);
  d.setDate(d.getDate() - 1);
  return d;
}
