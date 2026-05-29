import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  UserPlus,
  Users,
  CheckCircle2,
  Coins,
  Clock,
  ArrowRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { ensureReferralCode } from "@/lib/referrals";
import { POINTS } from "@/lib/constants";
import ReferralShareCard from "@/components/dashboard/ReferralShareCard";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://jayfield.com";

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  successful: {
    label: "Booking pertama selesai",
    classes: "bg-success/10 text-success",
  },
  pending: {
    label: "Belum booking",
    classes: "bg-warning/10 text-warning",
  },
  inactive: {
    label: "Akun nonaktif",
    classes: "bg-muted text-text-secondary",
  },
};

export default async function ReferralDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  // Generate referral code on first visit if missing.
  const referralCode = await ensureReferralCode(session.id);
  const shareUrl = `${SITE_URL}/${params.locale}/register?ref=${encodeURIComponent(referralCode)}`;

  // Pull referrals + stats in parallel.
  const [recentReferees, totalReferrals, totalSuccessful, pointsAgg] =
    await Promise.all([
      prisma.user.findMany({
        where: { referredById: session.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, createdAt: true, isActive: true },
      }),
      prisma.user.count({ where: { referredById: session.id } }),
      prisma.user.count({
        where: {
          referredById: session.id,
          pointsHistory: { some: { type: "EARNED_BOOKING" } },
        },
      }),
      prisma.pointsHistory.aggregate({
        where: { userId: session.id, type: "EARNED_REFERRAL" },
        _sum: { amount: true },
      }),
    ]);

  // Bonus + completion status per visible referee.
  const refereeIds = recentReferees.map((r) => r.id);
  const [completedRows, bonusRows] = await Promise.all([
    refereeIds.length > 0
      ? prisma.pointsHistory.findMany({
          where: { userId: { in: refereeIds }, type: "EARNED_BOOKING" },
          select: { userId: true },
          distinct: ["userId"],
        })
      : Promise.resolve([] as { userId: string }[]),
    refereeIds.length > 0
      ? prisma.pointsHistory.findMany({
          where: {
            userId: session.id,
            type: "EARNED_REFERRAL",
            referenceId: { in: refereeIds },
          },
          select: { referenceId: true, amount: true, createdAt: true },
        })
      : Promise.resolve([] as { referenceId: string | null; amount: number; createdAt: Date }[]),
  ]);

  const completedSet = new Set(completedRows.map((r) => r.userId));
  const bonusByReferee = new Map<
    string,
    { amount: number; awardedAt: Date }
  >();
  for (const r of bonusRows) {
    if (r.referenceId) {
      bonusByReferee.set(r.referenceId, {
        amount: r.amount,
        awardedAt: r.createdAt,
      });
    }
  }

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const pointsEarned = pointsAgg._sum.amount ?? 0;
  const pendingReferrals = Math.max(0, totalReferrals - totalSuccessful);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Ajak Teman, Dapat Poin
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Bagikan kode referral kamu — setiap teman yang menyelesaikan booking
          pertamanya, kamu dapat <strong>{POINTS.referral} poin</strong>.
        </p>
      </div>

      {/* Share card */}
      <ReferralShareCard
        code={referralCode}
        shareUrl={shareUrl}
        rewardPoints={POINTS.referral}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total ajakan"
          value={totalReferrals}
          tone="primary"
          hint={
            pendingReferrals > 0
              ? `${pendingReferrals} belum booking`
              : "Semua sudah aktif"
          }
        />
        <StatCard
          icon={CheckCircle2}
          label="Sukses booking"
          value={totalSuccessful}
          tone="success"
          hint="Sudah selesai 1 booking"
        />
        <StatCard
          icon={Coins}
          label="Poin terkumpul"
          value={pointsEarned}
          tone="cta"
          hint={`${POINTS.referral} poin per teman`}
        />
      </div>

      {/* How it works */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Cara kerjanya
        </h2>
        <ol className="space-y-3 text-sm">
          <Step
            num={1}
            title="Bagikan kode"
            desc="Salin kode atau link di atas, lalu kirim via WhatsApp / Telegram / sosmed."
          />
          <Step
            num={2}
            title="Teman daftar"
            desc="Mereka mendaftar pakai kode kamu. Otomatis tercatat sebagai ajakan kamu."
          />
          <Step
            num={3}
            title="Teman booking pertama"
            desc="Saat booking pertamanya selesai (status COMPLETED), bonus dicairkan otomatis."
          />
          <Step
            num={4}
            title={`Kamu dapat ${POINTS.referral} poin`}
            desc="Poin masuk ke saldo kamu dan bisa ditukar reward di halaman membership."
          />
        </ol>
        <Link
          href={`/${params.locale}/dashboard/membership`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light"
        >
          Lihat reward yang bisa ditukar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Recent referrals */}
      <div className="bg-surface border border-border rounded-xl">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg font-heading font-semibold">
            Ajakan terbaru
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            10 teman terbaru yang daftar pakai kode kamu
          </p>
        </div>

        {recentReferees.length === 0 ? (
          <div className="text-center py-12 px-6 text-text-secondary">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada ajakan</p>
            <p className="text-xs mt-1">
              Bagikan kode kamu lewat tombol di atas untuk memulai
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentReferees.map((r) => {
              const isSuccessful = completedSet.has(r.id);
              const bonus = bonusByReferee.get(r.id);
              const status: keyof typeof STATUS_LABEL = !r.isActive
                ? "inactive"
                : isSuccessful
                  ? "successful"
                  : "pending";
              const statusInfo = STATUS_LABEL[status];

              return (
                <li
                  key={r.id}
                  className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                    {r.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Daftar{" "}
                      {format(r.createdAt, "dd MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${statusInfo.classes}`}
                    >
                      {statusInfo.label}
                    </span>
                    {bonus ? (
                      <p className="text-xs text-success font-semibold mt-1">
                        +{bonus.amount} poin
                      </p>
                    ) : (
                      <p className="text-xs text-text-secondary mt-1">
                        — poin
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "primary" | "success" | "cta";
  hint?: string;
}) {
  const toneClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    cta: "text-cta bg-cta/10",
  }[tone];
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-2xl font-heading font-bold text-text-primary leading-tight">
          {value.toLocaleString("id-ID")}
        </p>
        {hint && (
          <p className="text-[11px] text-text-secondary truncate">{hint}</p>
        )}
      </div>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
        {num}
      </span>
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-text-secondary">{desc}</p>
      </div>
    </li>
  );
}
