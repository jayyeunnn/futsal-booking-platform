"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type RefundPreview = {
  eligible: boolean;
  percentage: number;
  amount: number;
  reason: string;
};

type Props = {
  bookingId: string;
  status: string;
  refundPreview: RefundPreview | null;
  open: boolean;
  onClose: () => void;
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Modal that previews refund eligibility (when CONFIRMED) and collects
 * cancellation reason + bank info (when refund > 0). Posts to
 * PUT /api/bookings/[id]/cancel.
 */
export function CancelBookingDialog({
  bookingId,
  status,
  refundPreview,
  open,
  onClose,
}: Props) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const requiresBankInfo = !!refundPreview?.eligible;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (reason.trim().length < 5) {
      setError("Alasan pembatalan minimal 5 karakter.");
      return;
    }
    if (requiresBankInfo) {
      if (!bankName || !accountNumber || !accountHolder) {
        setError("Detail rekening wajib diisi karena kamu eligible refund.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          ...(requiresBankInfo
            ? { bankName, accountNumber, accountHolder }
            : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal membatalkan booking";
        setError(msg);
        showToast.error("Pembatalan gagal", msg);
        return;
      }
      onClose();
      const refundEligible = json.data?.refund?.eligible;
      const refundAmount = json.data?.refund?.amount;
      if (refundEligible) {
        showToast.success(
          "Booking dibatalkan",
          `Refund Rp ${refundAmount.toLocaleString("id-ID")} akan diproses 1-3 hari kerja.`
        );
      } else {
        showToast.success("Booking dibatalkan");
      }
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal";
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-heading font-semibold text-text-primary">
            Batalkan Booking
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Refund preview */}
          {status === "CONFIRMED" && refundPreview && (
            <div
              className={`p-3 rounded-lg text-sm flex gap-2 ${
                refundPreview.eligible
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  {refundPreview.eligible
                    ? `Refund ${refundPreview.percentage}% — ${formatRupiah(refundPreview.amount)}`
                    : "Tidak ada refund"}
                </p>
                <p className="text-xs opacity-80">{refundPreview.reason}</p>
              </div>
            </div>
          )}

          {status !== "CONFIRMED" && (
            <p className="text-xs text-text-secondary bg-muted p-3 rounded-lg">
              Karena booking ini belum dikonfirmasi, tidak ada refund yang
              diproses.
            </p>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Alasan pembatalan <span className="text-error">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
              maxLength={500}
              rows={3}
              placeholder="Cth: Ada acara mendadak"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {requiresBankInfo && (
            <>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-text-primary mb-2">
                  Detail Rekening untuk Refund
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      Bank
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BCA / BNI / Mandiri"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      No. Rekening
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-10"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1 h-10"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Konfirmasi Batal"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
