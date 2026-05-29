import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthorizedCronRequest } from "@/lib/cron";
import {
  awardBookingCompletionPoints,
  maybeUpgradeTier,
} from "@/lib/points";
import { awardReferralBonusOnFirstBooking } from "@/lib/referrals";
import { createNotification } from "@/lib/notifications";
import { sendTierUpgradeEmail } from "@/emails/render";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/complete-bookings
 *
 * Marks confirmed bookings whose endTime has passed as COMPLETED, then:
 *   - Awards completion points (+ off-peak bonus)
 *   - Increments user.totalBookings
 *   - Checks for tier upgrade and notifies member if upgraded
 *
 * Idempotent: re-running won't double-award (guarded by PointsHistory lookup).
 *
 * Cron schedule: every 30 minutes is reasonable; Vercel currently registers
 * this as part of the booking lifecycle but caller can also hit it manually
 * via Bearer auth for backfills.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return errors.unauthorized("Cron auth required");
  }

  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Candidate bookings: CONFIRMED, date+endTime <= now.
    // Filter at SQL by date <= today, then filter time in-memory because
    // endTime is stored as "HH:mm" string.
    const candidates = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        bookingDate: { lte: today },
      },
      select: {
        id: true,
        userId: true,
        bookingDate: true,
        endTime: true,
        durationHours: true,
        startTime: true,
      },
    });

    const due = candidates.filter((b) => {
      const [h, m] = b.endTime.split(":").map((x) => parseInt(x, 10) || 0);
      const end = new Date(b.bookingDate);
      end.setHours(h, m, 0, 0);
      return end <= now;
    });

    let completed = 0;
    let totalPointsAwarded = 0;
    const upgrades: Array<{ userId: string; newTier: string }> = [];

    for (const b of due) {
      try {
        await prisma.booking.update({
          where: { id: b.id },
          data: { status: "COMPLETED" },
        });
        completed += 1;

        const earned = await awardBookingCompletionPoints({
          userId: b.userId,
          bookingId: b.id,
          durationHours: Number(b.durationHours),
          startTime: b.startTime,
        });
        if (earned) totalPointsAwarded += earned;

        // Award referral bonus if this was the referee's first completed
        // booking. Helper is idempotent and a no-op for non-referred users.
        try {
          await awardReferralBonusOnFirstBooking(b.userId);
        } catch (e) {
          console.error("[cron/complete-bookings] referral bonus failed", e);
        }

        const newTier = await maybeUpgradeTier(b.userId);
        if (newTier && (newTier === "SILVER" || newTier === "GOLD")) {
          upgrades.push({ userId: b.userId, newTier });
          const user = await prisma.user.findUnique({
            where: { id: b.userId },
            select: { name: true, email: true },
          });
          if (user) {
            // Email + in-app notification.
            await createNotification({
              userId: b.userId,
              title: `🎉 Selamat, naik ke ${newTier}!`,
              message: `Kamu resmi jadi member ${newTier}. Cek benefit barumu di halaman membership.`,
              type: "MEMBERSHIP",
              actionUrl: "/dashboard/membership",
            });
            try {
              await sendTierUpgradeEmail(user.email, user.name, newTier);
            } catch (e) {
              console.error("[cron] tier upgrade email failed", e);
            }
          }
        }
      } catch (e) {
        console.error("[cron/complete-bookings] failed for", b.id, e);
      }
    }

    return ok({
      completed,
      totalPointsAwarded,
      tierUpgrades: upgrades.length,
      upgradedUsers: upgrades,
    });
  } catch (e) {
    console.error("GET /api/cron/complete-bookings error:", e);
    return errors.server("Cron job gagal");
  }
}
