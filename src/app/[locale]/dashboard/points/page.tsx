import { redirect } from "next/navigation";
import { Coins, ArrowDown, ArrowUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  EARNED_BOOKING: "Booking selesai",
  EARNED_REVIEW: "Review",
  EARNED_REFERRAL: "Referral",
  EARNED_BONUS: "Bonus",
  REDEEMED_DISCOUNT: "Tukar diskon",
  REDEEMED_FREE_SESSION: "Tukar free session",
  REDEEMED_MERCHANDISE: "Tukar merchandise",
  ADMIN_ADJUST: "Penyesuaian admin",
};

export default async function PointsHistoryPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { direction?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const direction = (searchParams.direction as "earned" | "redeemed" | undefined) ?? "all";
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 30;

  const earnedTypes = [
    "EARNED_BOOKING",
    "EARNED_REVIEW",
    "EARNED_REFERRAL",
    "EARNED_BONUS",
    "ADMIN_ADJUST",
  ] as const;
  const redeemedTypes = [
    "REDEEMED_DISCOUNT",
    "REDEEMED_FREE_SESSION",
    "REDEEMED_MERCHANDISE",
  ] as const;

  const where = {
    userId: session.id,
    ...(direction === "earned" && { type: { in: [...earnedTypes] } }),
    ...(direction === "redeemed" && { type: { in: [...redeemedTypes] } }),
  };

  const [user, history, total, summary] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { totalPoints: true },
    }),
    prisma.pointsHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pointsHistory.count({ where }),
    prisma.pointsHistory.groupBy({
      by: ["type"],
      where: { userId: session.id },
      _sum: { amount: true },
    }),
  ]);

  if (!user) redirect(`/${params.locale}/login`);

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  let totalEarned = 0;
  let totalRedeemed = 0;
  for (const r of summary) {
    const a = r._sum.amount ?? 0;
    if (a > 0) totalEarned += a;
    else totalRedeemed += a;
  }
  const totalPages = Math.ceil(total / limit);

  const TabLink = ({
    label,
    value,
  }: {
    label: string;
    value: "all" | "earned" | "redeemed";
  }) => {
    const isActive = direction === value;
    return (
      <Link
        href={
          value === "all"
            ? `/${params.locale}/dashboard/points`
            : `/${params.locale}/dashboard/points?direction=${value}`
        }
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary text-white"
            : "text-text-secondary hover:bg-muted"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Riwayat Poin
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Track poin yang masuk dan ditukar
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <Coins className="h-3 w-3" /> Saldo
          </p>
          <p className="text-2xl font-heading font-bold text-cta mt-1">
            {user.totalPoints.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <ArrowUp className="h-3 w-3 text-success" /> Total didapat
          </p>
          <p className="text-2xl font-heading font-bold text-success mt-1">
            +{totalEarned.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <ArrowDown className="h-3 w-3 text-error" /> Total ditukar
          </p>
          <p className="text-2xl font-heading font-bold text-error mt-1">
            {totalRedeemed.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <TabLink label="Semua" value="all" />
          <TabLink label="Diterima" value="earned" />
          <TabLink label="Ditukar" value="redeemed" />
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Coins className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada riwayat poin</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((h) => {
              const positive = h.amount > 0;
              return (
                <li key={h.id} className="p-4 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      positive
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {positive ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {TYPE_LABEL[h.type] ?? h.type}
                    </p>
                    {h.description && (
                      <p className="text-xs text-text-secondary line-clamp-1">
                        {h.description}
                      </p>
                    )}
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {format(h.createdAt, "dd MMM yyyy · HH:mm", {
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold shrink-0 ${
                      positive ? "text-success" : "text-error"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {h.amount.toLocaleString("id-ID")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/${params.locale}/dashboard/points?${
                    direction !== "all" ? `direction=${direction}&` : ""
                  }page=${page - 1}`}
                  className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
                >
                  Sebelumnya
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/${params.locale}/dashboard/points?${
                    direction !== "all" ? `direction=${direction}&` : ""
                  }page=${page + 1}`}
                  className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
                >
                  Selanjutnya
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
