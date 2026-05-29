import { Trophy, Users, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { CountUp } from "./CountUp";
import { ScrollReveal } from "./ScrollReveal";

/**
 * Server component — real stats with animated counters.
 *   - total active courts
 *   - total bookings (all non-cancelled)
 *   - average rating across all visible reviews
 */
export default async function SocialProofBar() {
  const t = await getTranslations("landing");

  const [courtCount, bookingCount, ratingAgg] = await Promise.all([
    prisma.court.count({ where: { isActive: true } }),
    prisma.booking.count({
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED", "PENDING_PAYMENT", "PENDING_CONFIRMATION"],
        },
      },
    }),
    prisma.review.aggregate({
      where: { isVisible: true },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const displayBookings =
    bookingCount >= 100 ? Math.floor(bookingCount / 100) * 100 : bookingCount;

  const avgRating = ratingAgg._avg.rating ?? 0;
  const ratingLabel = avgRating > 0 ? avgRating.toFixed(1) : "—";

  return (
    <section className="bg-primary py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          <div className="flex items-center gap-3 text-white">
            <Trophy className="h-6 w-6 text-accent" />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-bold tabular-nums">
                {courtCount === 0 ? (
                  "—"
                ) : (
                  <CountUp value={courtCount} suffix="+" />
                )}
              </span>
              <span className="text-white/80 text-sm">{t("stats_courts")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white">
            <Users className="h-6 w-6 text-accent" />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-bold tabular-nums">
                {bookingCount === 0 ? (
                  "—"
                ) : (
                  <CountUp
                    value={displayBookings}
                    suffix={bookingCount >= 100 ? "+" : ""}
                  />
                )}
              </span>
              <span className="text-white/80 text-sm">
                {t("stats_bookings")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white">
            <Star className="h-6 w-6 text-accent" />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-bold tabular-nums">
                {ratingLabel}
              </span>
              <span className="text-white/80 text-sm">{t("stats_rating")}</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
