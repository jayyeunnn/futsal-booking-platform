import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { RefundStatusBadge } from "@/components/admin/RefundStatusBadge";
import { RefundActionButtons } from "@/components/admin/RefundActionButtons";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminRefundDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const refund = await prisma.refund.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          tier: true,
        },
      },
      booking: {
        include: {
          court: {
            include: {
              location: { select: { name: true, address: true } },
            },
          },
        },
      },
      payment: true,
      processedBy: { select: { name: true, email: true } },
    },
  });

  if (!refund) notFound();

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/refunds`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar refund
      </Link>

      {/* Summary card */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
              {formatRupiah(Number(refund.amount))}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {refund.refundPercentage}% dari pembayaran ·{" "}
              {format(refund.createdAt, "dd MMM yyyy HH:mm", {
                locale: dateLocale,
              })}
            </p>
          </div>
          <RefundStatusBadge status={refund.status} />
        </div>

        {refund.processedAt && refund.processedBy && (
          <p className="text-xs text-text-secondary mt-4 pt-4 border-t border-border">
            Diproses oleh <strong>{refund.processedBy.name}</strong> ·{" "}
            {format(refund.processedAt, "dd MMM yyyy HH:mm", {
              locale: dateLocale,
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User card */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3">
              User
            </h2>
            <p className="font-medium text-text-primary">{refund.user.name}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Tier: {refund.user.tier}
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p className="flex items-center gap-2 text-text-secondary">
                <Mail className="h-4 w-4" /> {refund.user.email}
              </p>
              {refund.user.phone && (
                <p className="flex items-center gap-2 text-text-secondary">
                  <Phone className="h-4 w-4" /> {refund.user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Booking */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3">
              Booking yang Direfund
            </h2>
            <p className="font-medium text-text-primary">
              {refund.booking.court.name}
            </p>
            <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {refund.booking.court.location.name},{" "}
              {refund.booking.court.location.address}
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p className="flex items-center gap-2 text-text-secondary">
                <Calendar className="h-4 w-4" />
                {format(refund.booking.bookingDate, "EEEE, dd MMM yyyy", {
                  locale: dateLocale,
                })}
              </p>
              <p className="flex items-center gap-2 text-text-secondary">
                ⏱️ {refund.booking.startTime} - {refund.booking.endTime}
              </p>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              ID Booking:{" "}
              <code className="font-mono text-xs">{refund.booking.id}</code>
            </p>
            <Link
              href={`/${params.locale}/dashboard/bookings/${refund.booking.id}`}
              className="inline-block mt-3 text-xs text-primary hover:underline"
            >
              Lihat detail booking →
            </Link>
          </div>

          {/* Payment source */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Sumber Pembayaran
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Metode</dt>
                <dd className="font-medium text-text-primary">
                  {refund.payment.paymentMethod}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Jumlah Asli Dibayar</dt>
                <dd className="font-medium text-text-primary">
                  {formatRupiah(Number(refund.payment.amount))}
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <dt className="font-medium text-text-primary">
                  Refund {refund.refundPercentage}%
                </dt>
                <dd className="font-bold text-success">
                  {formatRupiah(Number(refund.amount))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Reason */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-2">
              Alasan Pembatalan
            </h2>
            <p className="text-sm text-text-primary whitespace-pre-wrap">
              {refund.reason}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bank info */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Tujuan Transfer
            </h2>
            {refund.bankName ? (
              <>
                <p className="text-xs text-text-secondary">Bank</p>
                <p className="font-medium text-text-primary mb-3">
                  {refund.bankName}
                </p>
                <p className="text-xs text-text-secondary">No. Rekening</p>
                <p className="font-mono text-sm text-text-primary mb-3">
                  {refund.accountNumber}
                </p>
                <p className="text-xs text-text-secondary">Pemilik</p>
                <p className="font-medium text-text-primary">
                  {refund.accountHolder}
                </p>
              </>
            ) : (
              <p className="text-sm text-text-secondary">
                User belum melengkapi info bank.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3">
              Aksi
            </h2>
            <RefundActionButtons
              refundId={refund.id}
              status={refund.status}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
