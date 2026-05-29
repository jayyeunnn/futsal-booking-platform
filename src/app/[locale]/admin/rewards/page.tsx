import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Coins, Gift } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { RewardActionButtons } from "@/components/admin/RewardActionButtons";
import type { Prisma, RewardType } from "@prisma/client";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const TYPE_LABEL: Record<RewardType, string> = {
  DISCOUNT_PERCENT: "Diskon %",
  DISCOUNT_AMOUNT: "Diskon Rp",
  FREE_SESSION: "Free Session",
  MERCHANDISE: "Merchandise",
};

const TYPE_BADGE: Record<RewardType, string> = {
  DISCOUNT_PERCENT: "bg-cta/10 text-cta",
  DISCOUNT_AMOUNT: "bg-primary/10 text-primary",
  FREE_SESSION: "bg-success/10 text-success",
  MERCHANDISE: "bg-warning/10 text-warning",
};

function formatValue(type: RewardType, value: number): string {
  switch (type) {
    case "DISCOUNT_PERCENT":
      return `${value}%`;
    case "DISCOUNT_AMOUNT":
      return formatRupiah(value);
    case "FREE_SESSION":
      return `${value} jam`;
    case "MERCHANDISE":
      return "—";
  }
}

export default async function AdminRewardsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const status = searchParams.status;
  const search = searchParams.search?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const statusFilter: Prisma.RewardWhereInput =
    status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {};

  const where: Prisma.RewardWhereInput = {
    ...statusFilter,
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rewards, total, summary] = await Promise.all([
    prisma.reward.findMany({
      where,
      orderBy: [
        { isActive: "desc" },
        { sortOrder: "asc" },
        { pointsCost: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reward.count({ where }),
    prisma.reward.findMany({
      select: { isActive: true },
    }),
  ]);

  // Aggregate redemption counts per rewardKey untuk kolom "Pemakaian".
  const redemptionGroups = await prisma.redemption.groupBy({
    by: ["rewardKey"],
    _count: { _all: true },
    where: { rewardKey: { in: rewards.map((r) => r.code) } },
  });
  const redemptionCount: Record<string, number> = {};
  for (const g of redemptionGroups) {
    redemptionCount[g.rewardKey] = g._count._all;
  }

  const stats = {
    active: 0,
    inactive: 0,
  };
  for (const r of summary) {
    if (r.isActive) stats.active += 1;
    else stats.inactive += 1;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Reward Catalog
          </h1>
          <p className="text-sm text-text-secondary">
            Kelola katalog reward yang muncul di reward store member
          </p>
        </div>
        {session.role === "ADMIN" && (
          <Link
            href={`/${params.locale}/admin/rewards/new`}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Buat Reward
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Aktif</p>
          <p className="text-2xl font-heading font-bold text-success">
            {stats.active}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Nonaktif</p>
          <p className="text-2xl font-heading font-bold text-text-secondary">
            {stats.inactive}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-text-secondary">Total Reward</p>
          <p className="text-2xl font-heading font-bold text-primary">
            {stats.active + stats.inactive}
          </p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Cari kode atau nama reward..."
        select={{
          paramName: "status",
          allLabel: "Semua Status",
          options: [
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Nonaktif" },
          ],
        }}
      />

      {rewards.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-data"
            title="Belum ada reward"
            description="Tambah reward pertama agar member punya pilihan tukar poin."
            action={
              session.role === "ADMIN"
                ? {
                    label: "Buat Reward",
                    href: `/${params.locale}/admin/rewards/new`,
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-text-secondary text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Kode / Nama</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium text-right">Nilai</th>
                  <th className="px-4 py-3 font-medium text-right">Poin</th>
                  <th className="px-4 py-3 font-medium">Validity</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium text-right">Tukar</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {session.role === "ADMIN" && (
                    <th className="px-4 py-3 font-medium" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rewards.map((r) => {
                  const used = redemptionCount[r.code] ?? 0;
                  return (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono font-semibold text-primary">
                          {r.code}
                        </code>
                        <p className="text-sm font-medium text-text-primary line-clamp-1 mt-0.5">
                          {r.name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded ${
                            TYPE_BADGE[r.type]
                          }`}
                        >
                          {TYPE_LABEL[r.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-primary">
                        {formatValue(r.type, r.value)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-cta font-semibold">
                          <Coins className="h-3 w-3" />
                          {r.pointsCost.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {r.validForDays} hari
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.minTier ? (
                          <span className="text-warning font-medium">
                            {r.minTier}+
                          </span>
                        ) : (
                          <span className="text-text-secondary">Semua</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-text-secondary">
                        {used}x
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded ${
                            r.isActive
                              ? "bg-success/10 text-success"
                              : "bg-text-secondary/10 text-text-secondary"
                          }`}
                        >
                          {r.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      {session.role === "ADMIN" && (
                        <td className="px-4 py-3 text-right">
                          <RewardActionButtons
                            rewardId={r.id}
                            isActive={r.isActive}
                            locale={params.locale}
                            redemptionCount={used}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
              <span>
                Halaman {page} dari {totalPages} ({total} reward)
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/${params.locale}/admin/rewards?${new URLSearchParams(
                      {
                        ...(search ? { search } : {}),
                        ...(status ? { status } : {}),
                        page: String(page - 1),
                      }
                    )}`}
                    className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
                  >
                    Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/${params.locale}/admin/rewards?${new URLSearchParams(
                      {
                        ...(search ? { search } : {}),
                        ...(status ? { status } : {}),
                        page: String(page + 1),
                      }
                    )}`}
                    className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
                  >
                    Selanjutnya
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick legend */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 text-xs text-text-secondary flex items-start gap-2">
        <Gift className="h-4 w-4 text-cta shrink-0 mt-0.5" />
        <p>
          Reward tampil di halaman{" "}
          <code className="bg-surface px-1 py-0.5 rounded">
            /{params.locale}/dashboard/membership
          </code>{" "}
          (reward store) dengan urutan{" "}
          <strong>sortOrder asc</strong> lalu{" "}
          <strong>pointsCost asc</strong>. Kode reward tersimpan di
          <code className="bg-surface px-1 py-0.5 rounded mx-1">
            Redemption.rewardKey
          </code>
          — jangan rename kode setelah ada redemption (bikin entry baru kalau
          butuh perubahan besar).
        </p>
      </div>
    </div>
  );
}
