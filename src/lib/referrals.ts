import crypto from "crypto";
import prisma from "@/lib/prisma";
import { POINTS } from "@/lib/constants";
import { awardPoints, maybeUpgradeTier } from "@/lib/points";
import { createNotification } from "@/lib/notifications";

/**
 * Format: `JF-XXXXXX` where X is uppercase alphanumeric.
 * Avoids ambiguous chars (0/O, 1/I/L) for easier sharing by mouth.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_BODY_LEN = 6;

/**
 * Generate a referral code candidate. Format: `JF-XXXXXX`.
 * `userId` is hashed in to add entropy but the visible portion stays short.
 * Caller must verify uniqueness against the database.
 */
export function generateReferralCode(userId: string): string {
  const seed = crypto.randomBytes(8);
  // Mix the userId into the seed so two users called at the same nanosecond
  // still get different bytes if RNG were ever weak.
  const userBytes = Buffer.from(userId, "utf8");
  for (let i = 0; i < seed.length; i++) {
    seed[i] = seed[i] ^ (userBytes[i % userBytes.length] ?? 0);
  }
  let body = "";
  for (let i = 0; i < CODE_BODY_LEN; i++) {
    body += ALPHABET[seed[i] % ALPHABET.length];
  }
  return `JF-${body}`;
}

/**
 * Ensure the user has a referral code. Returns the (existing or new) code.
 * Idempotent: if user already has a code, returns it without writes.
 * Handles unique-constraint collisions by retrying up to 5 times.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (!user) throw new Error("User not found");
  if (user.referralCode) return user.referralCode;

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode(userId);
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true },
      });
      if (updated.referralCode) return updated.referralCode;
    } catch (e) {
      lastErr = e;
      // P2002: unique constraint failed -> retry
    }
  }
  throw new Error(
    `Failed to assign unique referral code after retries: ${String(lastErr)}`
  );
}

/**
 * Apply a referral code to a freshly registered user.
 * - Looks up the referrer by the supplied code.
 * - Sets `referee.referredById` (only if not already set).
 * - Refuses self-referral.
 * - Returns `{ ok: true, referrerId }` on success, `{ ok: false }` otherwise.
 *
 * Non-fatal by design: callers should swallow errors and continue registration.
 */
export async function applyReferralOnRegister(
  refereeId: string,
  referralCode: string
): Promise<{ ok: boolean; referrerId?: string }> {
  const code = referralCode.trim().toUpperCase();
  if (!code) return { ok: false };

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true, isActive: true },
  });
  if (!referrer || !referrer.isActive) return { ok: false };
  if (referrer.id === refereeId) return { ok: false };

  // Only set if not already referred (one-time link).
  const referee = await prisma.user.findUnique({
    where: { id: refereeId },
    select: { referredById: true },
  });
  if (!referee) return { ok: false };
  if (referee.referredById) return { ok: false };

  await prisma.user.update({
    where: { id: refereeId },
    data: { referredById: referrer.id },
  });

  return { ok: true, referrerId: referrer.id };
}

/**
 * Award referral bonus when the referee completes their FIRST booking.
 *
 * Idempotent: looks for an existing `EARNED_REFERRAL` PointsHistory row
 * with `referenceId = refereeId` for the referrer; if present, no-op.
 *
 * Awards `POINTS.referral` to the referrer. Sends in-app notification.
 * Safe to call from cron after `awardBookingCompletionPoints` — the helper
 * itself decides whether the referee qualifies.
 */
export async function awardReferralBonusOnFirstBooking(
  refereeId: string
): Promise<void> {
  const referee = await prisma.user.findUnique({
    where: { id: refereeId },
    select: { id: true, name: true, referredById: true },
  });
  if (!referee || !referee.referredById) return;

  // Only award after the FIRST completed booking. We detect this by counting
  // how many EARNED_BOOKING points history rows exist for the referee.
  const completedBookingCount = await prisma.pointsHistory.count({
    where: { userId: refereeId, type: "EARNED_BOOKING" },
  });
  if (completedBookingCount < 1) return;

  // Idempotency guard: has the referrer already been awarded for THIS referee?
  const already = await prisma.pointsHistory.findFirst({
    where: {
      userId: referee.referredById,
      type: "EARNED_REFERRAL",
      referenceId: refereeId,
    },
    select: { id: true },
  });
  if (already) return;

  await awardPoints({
    userId: referee.referredById,
    amount: POINTS.referral,
    type: "EARNED_REFERRAL",
    description: `Bonus referral: ${referee.name} menyelesaikan booking pertama`,
    referenceId: refereeId,
  });

  // Tier upgrade trigger for the referrer.
  await maybeUpgradeTier(referee.referredById);

  // In-app notification (non-fatal).
  try {
    await createNotification({
      userId: referee.referredById,
      title: "🎁 Bonus Referral Diterima",
      message: `Kamu mendapat ${POINTS.referral} poin karena ${referee.name} menyelesaikan booking pertamanya.`,
      type: "MEMBERSHIP",
      actionUrl: "/dashboard/points",
    });
  } catch (e) {
    console.error("[referrals] notification failed", e);
  }
}
