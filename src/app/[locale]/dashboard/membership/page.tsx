import { redirect } from "next/navigation";
import { Trophy, Coins, Calendar, Sparkles, Check } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { TIER_THRESHOLDS } from "@/lib/constants";
import { getActiveRewards } from "@/lib/rewards";
import { RewardCard } from "@/components/dashboard/RewardCard";

export const dynamic = "force-dynamic";

const TIER_BENEFITS = {
  BRONZE: [
    "Akses promo member eksklusif",
    "Kumpul poin di setiap booking",
  ],
  SILVER: [
    "Diskon 10% otomatis di setiap booking",
    "Priority booking H+1 di prime-time",
    "Semua benefit Bronze",
  ],
  GOLD: [
    "Diskon 20% otomatis di setiap booking",
    "Priority booking H+2 di prime-time",
    "Free extra time 15 menit per sesi",
    "Undangan event eksklusif",
    "Semua benefit Silver",
  ],
} as const;

const TIER_COLORS = {
  BRONZE: { bg: "bg-amber-700/10", text: "text-amber-700", ring: "ring-amber-700/30" },
  SILVER: { bg: "bg-slate-300/40", text: "text-slate-700", ring: "ring-slate-400" },
  GOLD: { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-400" },
} as const;

export default async function MembershipPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const [user, activeRedemptions, rewards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        tier: true,
        totalPoints: true,
        totalBookings: true,
        createdAt: true,
      },
    }),
    prisma.redemption.findMany({
      where: {
        userId: session.id,
        usedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { redeemedAt: "desc" },
    }),
    getActiveRewards(),
  ]);

  if (!user) redirect(`/${params.locale}/login`);

  const tierColor = TIER_COLORS[user.tier];
  const benefits = TIER_BENEFITS[user.tier];
  const nextThreshold =
    user.tier === "BRONZE"
      ? { tier: "SILVER" as const, ...TIER_THRESHOLDS.silver }
      : user.tier === "SILVER"
        ? { tier: "GOLD" as const, ...TIER_THRESHOLDS.gold }
        : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Membership
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Kumpul poin, naik tier, nikmati benefit eksklusif
        </p>
      </div>

      {/* Tier card */}
      <div className={`rounded-2xl border ${tierColor.ring} ring-1 bg-surface p-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${tierColor.bg}`}>
            <Trophy className={`h-8 w-8 ${tierColor.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-text-secondary">
              Tier kamu
            </p>
            <p className={`text-3xl font-heading font-bold ${tierColor.text}`}>
              {user.tier}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Member sejak{" "}
              {user.createdAt.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-4 text-right">
            <div>
              <p className="text-xs text-text-secondary">Total Poin</p>
              <p className="text-2xl font-heading font-bold text-cta">
                {user.totalPoints.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Booking</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {user.totalBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="grid grid-cols-2 gap-4 sm:hidden mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <Coins className="h-3 w-3" /> Poin
            </p>
            <p className="text-xl font-heading font-bold text-cta">
              {user.totalPoints.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Booking
            </p>
            <p className="text-xl font-heading font-bold text-primary">
              {user.totalBookings}
            </p>
          </div>
        </div>

        {/* Tier progress */}
        {nextThreshold ? (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium text-text-primary mb-3">
              Progress menuju <strong>{nextThreshold.tier}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Booking selesai</span>
                  <span>
                    {user.totalBookings} / {nextThreshold.bookings}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(100, (user.totalBookings / nextThreshold.bookings) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Poin terkumpul</span>
                  <span>
                    {user.totalPoints.toLocaleString("id-ID")} /{" "}
                    {nextThreshold.points.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cta rounded-full"
                    style={{
                      width: `${Math.min(100, (user.totalPoints / nextThreshold.points) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Naik tier saat <strong>salah satu</strong> target terpenuhi.
            </p>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-warning">
            <Sparkles className="h-4 w-4" />
            <span>Kamu sudah di tier tertinggi. Terima kasih atas loyalitas kamu!</span>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold mb-4">
          Benefit kamu sebagai {user.tier}
        </h2>
        <ul className="space-y-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tier comparison */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold mb-4">
          Perbandingan Tier
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-text-secondary">Benefit</th>
                <th className="py-2 px-2 text-amber-700 font-bold">BRONZE</th>
                <th className="py-2 px-2 text-slate-700 font-bold">SILVER</th>
                <th className="py-2 px-2 text-yellow-700 font-bold">GOLD</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Diskon otomatis</td>
                <td className="py-2 px-2">—</td>
                <td className="py-2 px-2">10%</td>
                <td className="py-2 px-2">20%</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Priority booking</td>
                <td className="py-2 px-2">—</td>
                <td className="py-2 px-2">H+1</td>
                <td className="py-2 px-2">H+2</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Free extra time</td>
                <td className="py-2 px-2">—</td>
                <td className="py-2 px-2">—</td>
                <td className="py-2 px-2">15 mnt</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Event eksklusif</td>
                <td className="py-2 px-2">—</td>
                <td className="py-2 px-2">—</td>
                <td className="py-2 px-2">✓</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Syarat</td>
                <td className="py-2 px-2 text-text-secondary">Daftar</td>
                <td className="py-2 px-2 text-text-secondary">15 booking / 500 poin</td>
                <td className="py-2 px-2 text-text-secondary">30 booking / 1500 poin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reward store */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-heading font-semibold">Tukar Poin</h2>
            <p className="text-sm text-text-secondary">
              Saldo: <span className="font-medium text-cta">{user.totalPoints.toLocaleString("id-ID")} poin</span>
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((r) => (
            <RewardCard
              key={r.key}
              reward={r}
              userPoints={user.totalPoints}
            />
          ))}
        </div>
      </div>

      {/* Active redemptions */}
      {activeRedemptions.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-heading font-semibold mb-4">
            Reward Aktif ({activeRedemptions.length})
          </h2>
          <div className="space-y-3">
            {activeRedemptions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-1">
                    {r.rewardName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Ditukar{" "}
                    {r.redeemedAt.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                    {r.expiresAt && (
                      <>
                        {" · "}berlaku s.d.{" "}
                        {r.expiresAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                </div>
                {r.discountCode ? (
                  <code className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono text-primary">
                    {r.discountCode}
                  </code>
                ) : (
                  <span className="text-xs text-text-secondary">
                    Klaim di lokasi
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
