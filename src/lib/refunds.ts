/**
 * Refund eligibility calculator (PRD §3.3.4).
 *
 *   H-1 (>= 24 jam sebelum jadwal): 100% DP refund
 *   Hari H, >= 3 jam sebelum jadwal:  50% DP refund
 *   < 3 jam sebelum jadwal:           0% (tidak ada refund)
 *
 * Pure function — no DB, easy to unit test.
 */

export type RefundEligibility = {
  /** Refund percentage (0, 50, 100). */
  percentage: 0 | 50 | 100;
  /** Refund amount in rupiah, derived from `paidAmount`. */
  amount: number;
  /** Hours from "now" until the booking start. Negative when already past. */
  hoursUntil: number;
  /** True when refund > 0. */
  eligible: boolean;
  /** Human-readable rationale, useful for UI feedback. */
  reason: string;
};

/**
 * @param bookingStartAt full ISO datetime of the booking start
 * @param paidAmount total amount actually paid by the user (DP or full)
 * @param now reference time (default: Date.now())
 */
export function calculateRefund(
  bookingStartAt: Date,
  paidAmount: number,
  now: Date = new Date()
): RefundEligibility {
  const diffMs = bookingStartAt.getTime() - now.getTime();
  const hoursUntil = diffMs / (1000 * 60 * 60);

  if (hoursUntil >= 24) {
    return {
      percentage: 100,
      amount: paidAmount,
      hoursUntil,
      eligible: true,
      reason: "Pembatalan H-1 (>= 24 jam sebelum jadwal)",
    };
  }
  if (hoursUntil >= 3) {
    return {
      percentage: 50,
      amount: Math.ceil(paidAmount * 0.5),
      hoursUntil,
      eligible: true,
      reason: "Pembatalan hari H, masih > 3 jam sebelum jadwal",
    };
  }
  if (hoursUntil >= 0) {
    return {
      percentage: 0,
      amount: 0,
      hoursUntil,
      eligible: false,
      reason: "Pembatalan < 3 jam sebelum jadwal — tidak ada refund",
    };
  }
  return {
    percentage: 0,
    amount: 0,
    hoursUntil,
    eligible: false,
    reason: "Booking sudah lewat jadwal",
  };
}

/**
 * Convenience: build a `Date` from a Booking's `bookingDate` (DATE)
 * and `startTime` (HH:mm) — both stored separately in the schema.
 */
export function bookingStartDate(
  bookingDate: Date,
  startTime: string
): Date {
  const [h = 0, m = 0] = startTime.split(":").map((s) => parseInt(s, 10) || 0);
  const d = new Date(bookingDate);
  d.setHours(h, m, 0, 0);
  return d;
}
