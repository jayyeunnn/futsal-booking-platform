import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { PromoActionButtons } from "@/components/admin/PromoActionButtons";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminPromosPage({
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
  const now = new Date();

  const statusFilter: Prisma.PromoWhereInput =
    status === "active"
      ? { isActive: true, startDate: { lte: now }, endDate: { gte: now } }
      : status === "inactive"
        ? { isActive: false }
        : status === "expired"
          ? { endDate: { lt: now } }
          : {};

  const where: Prisma.PromoWhereInput = {
    ...statusFilter,
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [promos, total, summary] = await Promise.all([
    prisma.promo.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.promo.count({ where }),
    prisma.promo.findMany({
      select: {
        isActive: true,
        startDate: true,
        endDate: true,
      },
    }),
  ]);

  const stats = {
    active: 0,
    expired: 0,
    inactive: 0,
  };
  for (const p of summary) {
    if (!p.isActive) stats.inactive += 1;
    else if (p.endDate < now) stats.expired += 1;
    else stats.active += 1;
  }

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Manajemen Promo
          </h1>
          <p className="text-sm text-text-secondary">
            Buat & kelola kode promo + diskon untuk customer
          </p>
        </div>
        <Link
          href={`/${params.locale}/admin/promos/new`}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> Buat Promo
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Aktif</p>
          <p className="text-2xl font-heading font-bold text-success">
            {stats.active}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Kadaluarsa</p>
          <p className="text-2xl font-heading font-bold text-warning">
            {stats.expired}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Nonaktif</p>
          <p className="text-2xl font-heading font-bold text-text-secondary">
            {stats.inactive}
          </p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Cari kode atau judul promo..."
        select={{
          paramName: "status",
          allLabel: "Semua Status",
          options: [
            { value: "active", label: "Aktif" },
            { value: "expired", label: "Kadaluarsa" },
            { value: "inactive", label: "Nonaktif" },
          ],
        }}
      />

      {promos.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-promos"
            title="Belum ada promo"
            description="Mulai bikin promo pertama untuk customer."
            action={{
              label: "Buat Promo",
              href: `/${params.locale}/admin/promos/new`,
            }}
          />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-text-secondary text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Kode / Judul</th>
                  <th className="px-4 py-3 font-medium">Diskon</th>
                  <th className="px-4 py-3 font-medium">Periode</th>
                  <th className="px-4 py-3 font-medium text-right">Pemakaian</th>
                  <th className="px-4 py-3 font-medium">Eligibilitas</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promos.map((p) => {
                  const isExpired = p.endDate < now;
                  const isExhausted =
                    p.usageLimit !== null && p.usageCount >= p.usageLimit;
                  const statusBadge = !p.isActive
                    ? {
                        label: "Nonaktif",
                        className: "bg-text-secondary/10 text-text-secondary",
                      }
                    : isExpired
                      ? {
                          label: "Kadaluarsa",
                          className: "bg-warning/10 text-warning",
                        }
                      : isExhausted
                        ? {
                            label: "Habis",
                            className: "bg-error/10 text-error",
                          }
                        : { label: "Aktif", className: "bg-success/10 text-success" };
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <code className="text-sm font-mono font-bold text-primary">
                          {p.code}
                        </code>
                        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                          {p.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-cta">
                          {p.discountType === "PERCENTAGE"
                            ? `${Number(p.discountValue)}%`
                            : formatRupiah(Number(p.discountValue))}
                        </p>
                        {p.maxDiscount && (
                          <p className="text-[10px] text-text-secondary">
                            max {formatRupiah(Number(p.maxDiscount))}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {format(p.startDate, "dd MMM", { locale: dateLocale })}
                        {" - "}
                        {format(p.endDate, "dd MMM yyyy", {
                          locale: dateLocale,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        <span className="font-medium text-text-primary">
                          {p.usageCount}
                        </span>
                        <span className="text-text-secondary">
                          {p.usageLimit ? ` / ${p.usageLimit}` : " / ∞"}
                        </span>
                        <p className="text-[10px] text-text-secondary">
                          {p.perUserLimit}x / user
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.memberOnly ? (
                          <span className="text-warning font-medium">
                            {p.minTier ? `${p.minTier}+` : "Member"}
                          </span>
                        ) : (
                          <span className="text-text-secondary">Semua</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PromoActionButtons
                          promoId={p.id}
                          isActive={p.isActive}
                          locale={params.locale}
                          usageCount={p.usageCount}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
              <span>
                Halaman {page} dari {totalPages} ({total} promo)
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/${params.locale}/admin/promos?${new URLSearchParams(
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
                    href={`/${params.locale}/admin/promos?${new URLSearchParams(
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
    </div>
  );
}
