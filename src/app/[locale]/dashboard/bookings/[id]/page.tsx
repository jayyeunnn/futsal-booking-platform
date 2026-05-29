import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Receipt,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { bookingStartDate, calculateRefund } from "@/lib/refunds";
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { BookingStatusTimeline } from "@/components/dashboard/BookingStatusTimeline";
import { BookingActions } from "@/components/dashboard/BookingActions";
import { PaymentProofUploader } from "@/components/booking/PaymentProofUploader";
import { BookingSuccessCard } from "@/components/booking/BookingSuccessCard";
import { Countdown } from "@/components/shared/Countdown";
import { ReviewForm } from "@/components/dashboard/ReviewForm";
import { StarRating } from "@/components/dashboard/StarRating";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Bukti",
  UPLOADED: "Bukti Terupload",
  CONFIRMED: "Terkonfirmasi",
  REJECTED: "Ditolak",
  EXPIRED: "Kadaluarsa",
};

export default async function BookingDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      court: {
        include: {
          location: {
            select: { name: true, address: true, city: true, phone: true },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      refunds: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });

  if (!booking) notFound();
  if (
    booking.userId !== session.id &&
    session.role !== "ADMIN" &&
    session.role !== "STAFF"
  ) {
    redirect(`/${params.locale}/dashboard/bookings`);
  }

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const formattedDate = format(booking.bookingDate, "EEEE, dd MMMM yyyy", {
    locale: dateLocale,
  });

  // Refund preview only meaningful when CONFIRMED.
  const paid = booking.payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((s, p) => s + Number(p.amount), 0);
  const startAt = bookingStartDate(booking.bookingDate, booking.startTime);
  const refundPreview =
    booking.status === "CONFIRMED" ? calculateRefund(startAt, paid) : null;

  const lastConfirmedPayment = booking.payments
    .filter((p) => p.status === "CONFIRMED")
    .sort((a, b) => (b.confirmedAt?.getTime() ?? 0) - (a.confirmedAt?.getTime() ?? 0))[0];

  // Pending payment that the user still needs to upload proof for.
  // Only the latest PENDING/UPLOADED payment is actionable.
  const pendingPayment = booking.payments.find(
    (p) => p.status === "PENDING" || p.status === "UPLOADED"
  );
  const paymentExpired =
    pendingPayment?.expiresAt
      ? pendingPayment.expiresAt.getTime() < Date.now()
      : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/dashboard/bookings`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar booking
      </Link>

      <div>
        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
            {booking.court.name}
          </h1>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-text-secondary flex items-center gap-1">
          <Hash className="h-3 w-3" /> ID: {booking.id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Booking info */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3">
              Detail Booking
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Tanggal</p>
                  <p className="font-medium text-text-primary">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Jam</p>
                  <p className="font-medium text-text-primary">
                    {booking.startTime} - {booking.endTime} (
                    {Number(booking.durationHours)} jam)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Lokasi</p>
                  <p className="font-medium text-text-primary">
                    {booking.court.location.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {booking.court.location.address},{" "}
                    {booking.court.location.city}
                  </p>
                </div>
              </div>
              {booking.court.location.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs text-text-secondary">Kontak Lokasi</p>
                    <p className="font-medium text-text-primary">
                      {booking.court.location.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-secondary mb-1">Catatan</p>
                <p className="text-sm text-text-primary">{booking.notes}</p>
              </div>
            )}
            {booking.cancelReason && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-secondary mb-1">
                  Alasan Pembatalan
                </p>
                <p className="text-sm text-error">{booking.cancelReason}</p>
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Ringkasan Pembayaran
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Total Booking</dt>
                <dd className="font-medium text-text-primary">
                  {formatRupiah(Number(booking.totalPrice))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Tipe Pembayaran</dt>
                <dd className="font-medium text-text-primary">
                  {booking.paymentType === "DP" ? "DP (50%)" : "Bayar Full"}
                </dd>
              </div>
              {booking.dpAmount && (
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Jumlah DP</dt>
                  <dd className="font-medium text-text-primary">
                    {formatRupiah(Number(booking.dpAmount))}
                  </dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <dt className="font-medium text-text-primary">Sudah dibayar</dt>
                <dd className="font-bold text-success">
                  {formatRupiah(paid)}
                </dd>
              </div>
            </dl>

            {/* Per-payment list */}
            {booking.payments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-medium text-text-secondary mb-2">
                  Riwayat Pembayaran
                </p>
                <ul className="space-y-2">
                  {booking.payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {p.paymentMethod} ·{" "}
                          {formatRupiah(Number(p.amount))}
                        </p>
                        <p className="text-text-secondary">
                          {format(p.createdAt, "dd MMM HH:mm", {
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                      <span className="text-text-secondary">
                        {PAYMENT_STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Refunds */}
          {booking.refunds.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="text-sm font-medium text-text-secondary mb-3">
                Refund
              </h2>
              <ul className="space-y-2">
                {booking.refunds.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {formatRupiah(Number(r.amount))} (
                        {r.refundPercentage}%)
                      </p>
                      <p className="text-xs text-text-secondary">
                        {r.bankName} · {r.accountNumber}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-text-secondary">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Payment proof upload — only visible while a payment is awaiting proof. */}
          {pendingPayment && booking.status === "PENDING_PAYMENT" && (
            <PaymentProofUploader
              bookingId={booking.id}
              existingProofUrl={pendingPayment.proofImageUrl}
              isExpired={paymentExpired}
            />
          )}
          {/* If status already moved to PENDING_CONFIRMATION, still show the uploaded proof for reference. */}
          {booking.status === "PENDING_CONFIRMATION" &&
            pendingPayment?.proofImageUrl && (
              <PaymentProofUploader
                bookingId={booking.id}
                existingProofUrl={pendingPayment.proofImageUrl}
              />
            )}

          {/* Premium success card — QR + calendar + share, hanya saat CONFIRMED */}
          {booking.status === "CONFIRMED" && (
            <BookingSuccessCard
              bookingId={booking.id}
              courtName={booking.court.name}
              locationName={booking.court.location.name}
              locationAddress={`${booking.court.location.address}, ${booking.court.location.city}`}
              bookingDate={booking.bookingDate}
              startTime={booking.startTime}
              endTime={booking.endTime}
              shareUrl={`${SITE_URL}/${params.locale}/dashboard/bookings/${booking.id}`}
              locale={params.locale}
            />
          )}

          {/* Actions */}
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            locale={params.locale}
            refundPreview={refundPreview}
          />

          {/* Review section — only when COMPLETED */}
          {booking.status === "COMPLETED" &&
            (booking.review ? (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h2 className="text-sm font-medium text-text-secondary mb-3">
                  Review Kamu
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={booking.review.rating} size="md" />
                  <span className="text-sm text-text-secondary">
                    {booking.review.rating}/5
                  </span>
                </div>
                {booking.review.comment && (
                  <p className="text-sm text-text-primary whitespace-pre-wrap">
                    {booking.review.comment}
                  </p>
                )}
                <p className="text-[11px] text-text-secondary mt-2">
                  Dikirim{" "}
                  {format(booking.review.createdAt, "dd MMM yyyy", {
                    locale: dateLocale,
                  })}
                </p>
              </div>
            ) : booking.userId === session.id ? (
              <ReviewForm bookingId={booking.id} />
            ) : null)}
        </div>

        {/* Sidebar — timeline */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-text-secondary mb-4">
              Status
            </h2>
            <BookingStatusTimeline
              status={booking.status}
              createdAt={booking.createdAt}
              cancelledAt={booking.cancelledAt}
              confirmedAt={lastConfirmedPayment?.confirmedAt ?? null}
              locale={params.locale}
            />
          </div>

          {booking.status === "PENDING_PAYMENT" &&
            booking.payments[0]?.expiresAt && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-sm text-warning">
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Sisa waktu pembayaran
                </p>
                <p className="mt-2 text-2xl">
                  <Countdown
                    deadline={booking.payments[0].expiresAt}
                    warnAt={1200}
                    criticalAt={300}
                  />
                </p>
                <p className="mt-2 text-xs">
                  Deadline:{" "}
                  {format(
                    booking.payments[0].expiresAt,
                    "dd MMM yyyy · HH:mm 'WIB'",
                    { locale: dateLocale }
                  )}
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
