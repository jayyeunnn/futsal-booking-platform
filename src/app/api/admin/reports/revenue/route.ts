import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  formatDateOnly,
  parseDateRange,
  type GroupBy,
} from "@/lib/reports";
import { getRevenueReport } from "@/lib/report-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month
 *
 * Returns confirmed payment revenue grouped by the requested period plus
 * summary totals for the date range.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const { searchParams } = new URL(request.url);
    const groupByParam = searchParams.get("groupBy");
    const groupBy: GroupBy =
      groupByParam === "week" || groupByParam === "month"
        ? groupByParam
        : "day";
    const { from, to } = parseDateRange(
      searchParams.get("from"),
      searchParams.get("to")
    );

    const report = await getRevenueReport(from, to, groupBy);
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
    console.error("GET /api/admin/reports/revenue error:", e);
    return errors.server("Gagal memuat laporan pendapatan");
  }
}

function toInclusive(toExclusive: Date): Date {
  const d = new Date(toExclusive);
  d.setDate(d.getDate() - 1);
  return d;
}
