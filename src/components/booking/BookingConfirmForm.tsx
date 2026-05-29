"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { FieldHint } from "@/components/shared/FieldHint";
import { StickyMobileCta } from "@/components/shared/StickyMobileCta";

type PaymentMethod = {
  id: string;
  name: string;
  type: "BANK_TRANSFER" | "E_WALLET";
  accountNumber: string;
  accountHolder: string;
};

type Props = {
  locale: string;
  /** Dipakai untuk POST /api/bookings */
  courtId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  duration: number; // jam
  recurring: boolean;
  /** Display only — server menghitung ulang harga dari pricing tabel */
  courtName: string;
  locationName: string;
  estimatedSubtotal: number;
  /** Member tier-driven discount preview (server akan validasi ulang) */
  memberDiscountPct: number;
  paymentMethods: {
    bank: PaymentMethod[];
    eWallet: PaymentMethod[];
  };
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

/**
 * Real booking confirmation form.
 *
 * Flow:
 *   1. User picks payment type (DP/FULL), payment method, and optional promo.
 *   2. "Validate promo" hits /api/promos/validate to preview discount.
 *   3. "Confirm & Pay" POSTs /api/bookings — server applies member discount
 *      + promo + recurring template, returns booking ID.
 *   4. On success, push to /dashboard/bookings/[id] where the user uploads
 *      bukti transfer via the existing PaymentProofUploader component.
 *
 * Member-tier discount is shown as a preview on the right column. The server
 * is the source of truth — ringkasan akan refresh after the booking is created.
 */
export function BookingConfirmForm({
  locale,
  courtId,
  bookingDate,
  startTime,
  endTime,
  duration,
  recurring,
  courtName,
  locationName,
  estimatedSubtotal,
  memberDiscountPct,
  paymentMethods,
}: Props) {
  const router = useRouter();
  const isEN = locale === "en";
  const t = (id: string, en: string) => (isEN ? en : id);

  const [paymentType, setPaymentType] = useState<"DP" | "FULL">("DP");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const memberDiscount = useMemo(
    () =>
      memberDiscountPct > 0
        ? Math.ceil((estimatedSubtotal * memberDiscountPct) / 100)
        : 0,
    [estimatedSubtotal, memberDiscountPct],
  );

  const afterMember = estimatedSubtotal - memberDiscount;
  const promoDiscount = promo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, afterMember - promoDiscount);
  const dpAmount = Math.ceil(finalTotal * 0.5);
  const payable = paymentType === "DP" ? dpAmount : finalTotal;

  const validatePromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setValidatingPromo(true);
    setErr(null);
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, totalAmount: afterMember }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg =
          json?.error?.message ??
          t("Kode promo tidak valid", "Promo code invalid");
        showToast.error(t("Promo gagal", "Promo failed"), msg);
        setPromo(null);
        return;
      }
      const data = json.data;
      setPromo({
        code,
        discountAmount: data.discountAmount ?? 0,
        description: data.title ?? data.description ?? code,
      });
      showToast.success(
        t("Kode promo diterapkan", "Promo applied"),
        `${code} · -${formatPrice(data.discountAmount ?? 0)}`,
      );
    } catch (e) {
      showToast.error(
        t("Gagal cek promo", "Failed to validate"),
        e instanceof Error ? e.message : "Network error",
      );
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromo = () => {
    setPromo(null);
    setPromoCode("");
  };

  const handleSubmit = async () => {
    setErr(null);
    if (!paymentMethod) {
      setErr(t("Pilih metode pembayaran dulu", "Pick a payment method first"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          bookingDate,
          startTime,
          endTime,
          paymentType,
          paymentMethod,
          promoCode: promo?.code ?? undefined,
          isRecurring: recurring,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg =
          json?.error?.message ??
          t("Gagal membuat booking", "Failed to create booking");
        setErr(msg);
        showToast.error(t("Booking gagal", "Booking failed"), msg);
        return;
      }
      showToast.success(
        t("Booking dibuat", "Booking created"),
        t(
          "Lanjutkan dengan upload bukti transfer.",
          "Continue with proof upload.",
        ),
      );
      const bookingId = json.data?.bookingId;
      if (bookingId) {
        router.push(`/${locale}/dashboard/bookings/${bookingId}`);
      } else {
        router.push(`/${locale}/dashboard/bookings`);
      }
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : t("Terjadi kesalahan jaringan", "Network error");
      setErr(msg);
      showToast.error(t("Booking gagal", "Booking failed"), msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Panel */}
      <div className="lg:col-span-3 space-y-6">
        {/* Booking Details */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-4">
            {t("Detail Booking", "Booking Details")}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-text-secondary w-24 shrink-0">
                {t("Lokasi:", "Location:")}
              </span>
              <span className="text-text-primary font-medium">
                {locationName}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-secondary w-24 shrink-0">
                {t("Lapangan:", "Court:")}
              </span>
              <span className="text-text-primary font-medium">
                {courtName}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-secondary w-24 shrink-0">
                {t("Tanggal:", "Date:")}
              </span>
              <span className="text-text-primary font-medium">
                {new Date(bookingDate).toLocaleDateString(
                  isEN ? "en-US" : "id-ID",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-secondary w-24 shrink-0">
                {t("Waktu:", "Time:")}
              </span>
              <span className="text-text-primary font-medium">
                {startTime} - {endTime} ({duration} {t("jam", "hours")})
              </span>
            </div>
            {recurring && (
              <div className="flex items-start gap-2">
                <span className="text-text-secondary w-24 shrink-0">
                  {t("Recurring:", "Recurring:")}
                </span>
                <span className="text-accent font-medium">
                  {t("Setiap minggu ✓", "Every week ✓")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Type */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-4">
            {t("Tipe Pembayaran", "Payment Type")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentType("DP")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                paymentType === "DP"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    paymentType === "DP"
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {paymentType === "DP" && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-text-primary">
                  {t("DP 50%", "DP 50%")}
                </span>
              </div>
              <p className="text-lg font-bold text-primary ml-6">
                {formatPrice(dpAmount)}
              </p>
              <p className="text-xs text-text-secondary ml-6">
                {t("Sisa dibayar di tempat", "Pay the rest on-site")}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType("FULL")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                paymentType === "FULL"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    paymentType === "FULL"
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {paymentType === "FULL" && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-text-primary">
                  {t("Bayar Full", "Full Payment")}
                </span>
              </div>
              <p className="text-lg font-bold text-primary ml-6">
                {formatPrice(finalTotal)}
              </p>
              <p className="text-xs text-text-secondary ml-6">
                {t(
                  "Tidak perlu repot bayar di tempat",
                  "No need to pay on arrival",
                )}
              </p>
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-4">
            {t("Metode Pembayaran", "Payment Method")}
          </h3>

          {paymentMethods.bank.length > 0 && (
            <>
              <p className="text-sm text-text-secondary mb-3">
                {t("Transfer Bank", "Bank Transfer")}:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {paymentMethods.bank.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.name)}
                    className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      paymentMethod === m.name
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 text-text-secondary"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {paymentMethods.eWallet.length > 0 && (
            <>
              <p className="text-sm text-text-secondary mb-3">
                {t("E-Wallet", "E-Wallet")}:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentMethods.eWallet.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.name)}
                    className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      paymentMethod === m.name
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 text-text-secondary"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {paymentMethod && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-text-secondary">
              {t(
                "Setelah konfirmasi, kamu akan diarahkan ke halaman upload bukti transfer.",
                "After confirming, you'll be routed to the proof upload page.",
              )}
            </div>
          )}
        </div>

        {/* Promo Code */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-3">
            {t("Kode Promo", "Promo Code")}
          </h3>
          {promo ? (
            <div className="flex items-center justify-between p-3 bg-success/5 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div>
                  <p className="font-mono font-semibold text-success">
                    {promo.code}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {promo.description} · -{formatPrice(promo.discountAmount)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removePromo}
                className="text-xs text-text-secondary hover:text-error transition-colors"
              >
                {t("Hapus", "Remove")}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t(
                  "Masukkan kode promo",
                  "Enter promo code",
                )}
                className="flex-1 h-11 px-4 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm uppercase"
              />
              <Button
                variant="default"
                onClick={validatePromo}
                disabled={validatingPromo || !promoCode.trim()}
              >
                {validatingPromo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("Gunakan", "Apply")
                )}
              </Button>
            </div>
          )}
          <FieldHint>
            {t(
              "Bisa juga pakai kode reward (JF-XXXXXX) yang ditukar dari poin.",
              "You can also use a reward code (JF-XXXXXX) redeemed from points.",
            )}
          </FieldHint>
        </div>
      </div>

      {/* Right Panel - Summary */}
      <div className="lg:col-span-2">
        <div className="bg-surface border border-border rounded-xl p-6 sticky top-[90px]">
          <h3 className="font-heading font-semibold mb-4">
            {t("Ringkasan Pembayaran", "Payment Summary")}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">
                {t("Subtotal", "Subtotal")} ({duration} {t("jam", "hours")})
              </span>
              <span>{formatPrice(estimatedSubtotal)}</span>
            </div>
            {memberDiscount > 0 && (
              <div className="flex justify-between text-accent">
                <span>
                  {t("Diskon Member", "Member Discount")} ({memberDiscountPct}%)
                </span>
                <span>-{formatPrice(memberDiscount)}</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div className="flex justify-between text-accent">
                <span>
                  {t("Promo", "Promo")} {promo?.code}
                </span>
                <span>-{formatPrice(promoDiscount)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-border my-3 pt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>{t("Total", "Total")}</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {paymentType === "DP" && (
            <div className="bg-primary/5 rounded-lg p-3 mt-3 space-y-1 text-sm">
              <div className="flex justify-between font-semibold">
                <span>{t("Bayar Sekarang (DP 50%)", "Pay Now (DP 50%)")}</span>
                <span className="text-primary">{formatPrice(dpAmount)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>{t("Sisa di tempat", "Remaining on-site")}</span>
                <span>{formatPrice(finalTotal - dpAmount)}</span>
              </div>
            </div>
          )}

          {err && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-error/10 text-error border border-error/30 rounded-lg text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <Button
            variant="cta"
            className="w-full h-12 mt-6 text-base font-semibold"
            disabled={!paymentMethod || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Memproses...", "Processing...")}
              </span>
            ) : (
              t("Konfirmasi & Bayar", "Confirm & Pay")
            )}
          </Button>

          <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {t("Batas waktu pembayaran:", "Payment deadline:")} 1{" "}
              {t("jam", "hour")}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile sticky CTA — supaya tombol bayar selalu thumb-reach,
        sementara user scroll review detail booking + summary di atas. */}
    <StickyMobileCta
      primary={
        <span>
          {t("Total", "Total")}: {formatPrice(payable)}
        </span>
      }
      secondary={
        <span>
          {paymentType === "DP"
            ? t("DP 50% sekarang", "50% DP now")
            : t("Bayar lunas", "Full payment")}
        </span>
      }
      action={
        <Button
          variant="cta"
          className="h-11 px-5 font-semibold"
          disabled={!paymentMethod || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("Konfirmasi", "Confirm")
          )}
        </Button>
      }
    />
    </>
  );
}
