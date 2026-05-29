import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Coins, Trophy } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { AdjustPointsForm } from "@/components/admin/AdjustPointsForm";

export const dynamic = "force-dynamic";

const TIER_BADGE: Record<string, string> = {
  BRONZE: "bg-amber-700/10 text-amber-700",
  SILVER: "bg-slate-300/40 text-slate-700",
  GOLD: "bg-yellow-100 text-yellow-700",
};

const TYPE_LABEL: Record<string, string> = {
  EARNED_BOOKING: "Booking selesai",
  EARNED_REVIEW: "Review",
  EARNED_REFERRAL: "Referral",
  EARNED_BONUS: "Bonus",
  REDEEMED_DISCOUNT: "Tukar diskon",
  REDEEMED_FREE_SESSION: "Tukar free session",
  REDEEMED_MERCHANDISE: "Tukar merch",
  ADMIN_ADJUST: "Penyesuaian admin",
};

export default async function AdminMemberDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const [member, pointsHistory, redemptions, completedBookings] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: params.id, role: "USER" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          tier: true,
          totalPoints: true,
          totalBookings: true,
          provider: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.pointsHistory.findMany({
        where: { userId: params.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.redemption.findMany({
        where: { userId: params.id },
        orderBy: { redeemedAt: "desc" },
        take: 20,
      }),
      prisma.booking.count({
        where: { userId: params.id, status: "COMPLETED" },
      }),
    ]);

  if (!member) notFound();

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/members`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar member
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Member card */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-heading font-bold">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-heading font-bold text-text-primary line-clamp-1">
                  {member.name}
                </h1>
                <span
                  className={`inline-block mt-1 text-[10px] font-bold px-2 py-1 rounded ${TIER_BADGE[member.tier]}`}
                >
                  {member.tier}
                </span>
                {!member.isActive && (
                  <span className="ml-2 text-[10px] font-bold px-2 py-1 rounded bg-error/10 text-error">
                    NONAKTIF
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  Bergabung{" "}
                  {format(member.createdAt, "dd MMM yyyy", {
                    locale: dateLocale,
                  })}
                </span>
              </div>
              {member.provider && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-xs">Provider:</span>
                  <span className="text-xs font-medium">{member.provider}</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Coins className="h-3 w-3" /> Poin
                </p>
                <p className="text-xl font-heading font-bold text-cta">
                  {member.totalPoints.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Total booking
                </p>
                <p className="text-xl font-heading font-bold text-text-primary">
                  {member.totalBookings}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Selesai</p>
                <p className="text-xl font-heading font-bold text-primary">
                  {completedBookings}
                </p>
              </div>
            </div>
          </div>

          {/* Points history */}
          <div className="bg-surface border border-border rounded-xl">
            <div className="p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-text-primary">
                Riwayat Poin (30 terbaru)
              </h2>
            </div>
            {pointsHistory.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                Belum ada riwayat poin
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pointsHistory.map((h) => {
                  const positive = h.amount > 0;
                  return (
                    <li
                      key={h.id}
                      className="px-5 py-3 flex items-center gap-3 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary line-clamp-1">
                          {TYPE_LABEL[h.type] ?? h.type}
                        </p>
                        {h.description && (
                          <p className="text-xs text-text-secondary line-clamp-1">
                            {h.description}
                          </p>
                        )}
                        <p className="text-[11px] text-text-secondary">
                          {format(h.createdAt, "dd MMM yyyy HH:mm", {
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          positive ? "text-success" : "text-error"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {h.amount.toLocaleString("id-ID")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Redemptions */}
          {redemptions.length > 0 && (
            <div className="bg-surface border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h2 className="font-heading font-semibold text-text-primary">
                  Reward yang Ditukar ({redemptions.length})
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {redemptions.map((r) => (
                  <li
                    key={r.id}
                    className="px-5 py-3 flex items-center gap-3 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {r.rewardName}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {format(r.redeemedAt, "dd MMM yyyy", {
                          locale: dateLocale,
                        })}{" "}
                        · -{r.pointsSpent} poin
                        {r.usedAt && (
                          <>
                            {" · "}terpakai{" "}
                            {format(r.usedAt, "dd MMM", {
                              locale: dateLocale,
                            })}
                          </>
                        )}
                      </p>
                    </div>
                    {r.discountCode && (
                      <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                        {r.discountCode}
                      </code>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar — adjust points (admin only) */}
        <div className="space-y-6">
          {isAdmin ? (
            <AdjustPointsForm
              memberId={member.id}
              currentPoints={member.totalPoints}
            />
          ) : (
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm text-text-secondary">
                Hanya ADMIN yang dapat mengubah poin secara manual.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
