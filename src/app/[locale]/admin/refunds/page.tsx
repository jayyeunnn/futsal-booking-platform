import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Receipt } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { RefundStatusBadge } from "@/components/admin/RefundStatusBadge";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import type { Prisma, RefundStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["REQUESTED", "APPROVED", "REJECTED", "PROCESSED"] as const;

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminRefundsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const status = (
    VALID_STATUS as readonly string[]
  ).includes(searchParams.status ?? "")
    ? (searchParams.status as RefundStatus)
    : null;
  const search = searchParams.search?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const where: Prisma.RefundWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            },
            { bookingId: { contains: search } },
            { id: { contains: search } },
          ],
        }
      : {}),
  };

  const [refunds, total, summary] = await Promise.all([
    prisma.refund.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        booking: {
          select: { id: true, court: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.refund.count({ where }),
    prisma.refund.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusCount: Record<RefundStatus, number> = {
    REQUESTED: 0,
    APPROVED: 0,
    REJECTED: 0,
    PROCESSED: 0,
  };
  for (const s of summary) statusCount[s.status] = s._count._all;
  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Manajemen Refund
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Approve, reject, dan track status refund
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Menunggu</p>
          <p className="text-2xl font-heading font-bold text-warning">
            {statusCount.REQUESTED}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Disetujui</p>
          <p className="text-2xl font-heading font-bold text-info">
            {statusCount.APPROVED}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Selesai</p>
          <p className="text-2xl font-heading font-bold text-success">
            {statusCount.PROCESSED}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Ditolak</p>
          <p className="text-2xl font-heading font-bold text-error">
            {statusCount.REJECTED}
          </p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilterBar
        searchPlaceholder="Cari nama, email, atau ID booking..."
        select={{
          paramName: "status",
          allLabel: "Semua Status",
          options: [
            { value: "REQUESTED", label: "Menunggu" },
            { value: "APPROVED", label: "Disetujui" },
            { value: "PROCESSED", label: "Selesai" },
            { value: "REJECTED", label: "Ditolak" },
          ],
        }}
      />

      {/* List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {refunds.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Tidak ada refund ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-text-secondary text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Booking</th>
                  <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Bank</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {format(r.createdAt, "dd MMM yyyy", {
                        locale: dateLocale,
                      })}
                      <br />
                      {format(r.createdAt, "HH:mm", { locale: dateLocale })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {r.user.name}
                      </p>
                      <p className="text-xs text-text-secondary line-clamp-1">
                        {r.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {r.booking.court.name}
                      </p>
                      <p className="text-text-secondary font-mono text-[11px] line-clamp-1">
                        {r.booking.id.slice(0, 12)}…
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-text-primary">
                        {formatRupiah(Number(r.amount))}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {r.refundPercentage}%
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.bankName ? (
                        <>
                          <p className="font-medium text-text-primary">
                            {r.bankName}
                          </p>
                          <p className="text-text-secondary">
                            {r.accountNumber}
                          </p>
                        </>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RefundStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${params.locale}/admin/refunds/${r.id}`}
                        className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                      >
                        Detail <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
            <span>
              Halaman {page} dari {totalPages} ({total} refund)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/${params.locale}/admin/refunds?${new URLSearchParams(
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
                  href={`/${params.locale}/admin/refunds?${new URLSearchParams(
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
    </div>
  );
}
