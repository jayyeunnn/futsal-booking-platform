/**
 * Shared helpers for the admin reports module.
 *
 * The same date-range parsing logic is used by both the page server component
 * and the report API routes — keeping it in one place avoids drift.
 */

export type GroupBy = "day" | "week" | "month";

export const DEFAULT_RANGE_DAYS = 30;
/** Operating hours per day (08:00 - 00:00). Mirrors admin overview. */
export const OPERATING_HOURS_PER_DAY = 16;

/**
 * Parse `from` / `to` query strings (ISO date-only "YYYY-MM-DD" or full ISO).
 * Falls back to the last `DEFAULT_RANGE_DAYS` days when missing/invalid.
 *
 * Returned dates are normalized:
 *   - `from`: 00:00:00.000 of the chosen start day (inclusive)
 *   - `to`:   00:00:00.000 of the day AFTER the chosen end day (exclusive),
 *              so callers can use `>= from && < to` consistently.
 */
export function parseDateRange(
  fromInput?: string | null,
  toInput?: string | null
): { from: Date; to: Date } {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  let from = parseDateOnly(fromInput);
  let to = parseDateOnly(toInput);

  if (!to) {
    to = new Date(todayStart);
  }
  if (!from) {
    from = new Date(to);
    from.setDate(from.getDate() - (DEFAULT_RANGE_DAYS - 1));
  }
  // Normalize to start-of-day boundaries.
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  // Ensure ordering.
  if (from > to) {
    [from, to] = [to, from];
  }
  // Make `to` exclusive by advancing one day.
  const toExclusive = new Date(to);
  toExclusive.setDate(toExclusive.getDate() + 1);
  return { from, to: toExclusive };
}

function parseDateOnly(input?: string | null): Date | null {
  if (!input) return null;
  // Accept "YYYY-MM-DD" and full ISO strings.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !year ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  // Build in local time so day buckets line up with the operator's timezone.
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO week starts Monday. Returns the Monday of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  // getDay: 0 (Sun) - 6 (Sat). Convert to ISO offset where Monday = 0.
  const dow = out.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  out.setDate(out.getDate() - offset);
  return out;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Bucket a date to the given groupBy granularity. Returns an "ISO date-only"
 * string for `day`, a Monday "YYYY-MM-DD" for `week`, or "YYYY-MM" for `month`.
 */
export function bucketKey(date: Date, groupBy: GroupBy): string {
  if (groupBy === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  if (groupBy === "week") {
    return formatDateOnly(startOfWeek(date));
  }
  return formatDateOnly(date);
}

/**
 * Generate every bucket key between `from` (inclusive) and `to` (exclusive)
 * in chronological order. Used to fill zero-rows when no data exists.
 */
export function listBuckets(from: Date, to: Date, groupBy: GroupBy): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  while (cursor < to) {
    const key = bucketKey(cursor, groupBy);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/** Inclusive day count between `from` (inclusive) and `to` (exclusive). */
export function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
