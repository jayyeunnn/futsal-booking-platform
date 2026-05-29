import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { getTranslations } from "next-intl/server";
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { BookingActionButtons } from "@/components/admin/BookingActionButtons";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Prisma, BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminBookingsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  const t = await getTranslations("admin");

  const statusParam = searchParams.status;
  const validStatuses = [
    "PENDING_PAYMENT",
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "EXPIRED",
  ] as const;
  const status =
    statusParam && (validStatuses as readonly string[]).includes(statusParam)
      ? (statusParam as BookingStatus)
      : null;
  const search = searchParams.search?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search } },
            {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        court: {
          include: { location: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
          {t("bookings")}
        </h1>
        <p className="text-sm text-text-secondary">
          Kelola semua booking dari semua user
        </p>
      </div>

      <AdminFilterBar
        searchPlaceholder="Cari nama, email, atau ID booking..."
        select={{
          paramName: "status",
          allLabel: "Semua Status",
          options: [
            { value: "PENDING_PAYMENT", label: "Belum Bayar" },
            { value: "PENDING_CONFIRMATION", label: "Menunggu Konfirmasi" },
            { value: "CONFIRMED", label: "Dikonfirmasi" },
            { value: "COMPLETED", label: "Selesai" },
            { value: "CANCELLED", label: "Dibatalkan" },
            { value: "EXPIRED", label: "Hangus" },
          ],
        }}
      />

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {bookings.length === 0 ? (
          <EmptyState
            variant="no-bookings"
            title="Tidak ada booking"
            description="Tidak ada booking yang cocok dengan filter ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-text-secondary text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Tanggal Booking</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Lapangan</th>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {format(b.bookingDate, "EEE, dd MMM yyyy", {
                        locale: dateLocale,
                      })}
                      <br />
                      <span className="text-[10px]">
                        Dibuat:{" "}
                        {format(b.createdAt, "dd/MM HH:mm", {
                          locale: dateLocale,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {b.user.name}
                      </p>
                      <p className="text-xs text-text-secondary line-clamp-1">
                        {b.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {b.court.name}
                      </p>
                      <p className="text-text-secondary line-clamp-1">
                        {b.court.location.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {b.startTime} - {b.endTime}
                      <br />
                      <span className="text-[10px]">
                        ({Number(b.durationHours)} jam)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">
                      {formatRupiah(Number(b.totalPrice))}
                      <br />
                      <span className="text-[10px] text-text-secondary">
                        {b.paymentType === "DP" ? "DP 50%" : "Full"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <BookingActionButtons
                        bookingId={b.id}
                        status={b.status}
                      />
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
              Halaman {page} dari {totalPages} ({total} booking)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/${params.locale}/admin/bookings?${new URLSearchParams(
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
                  href={`/${params.locale}/admin/bookings?${new URLSearchParams(
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
