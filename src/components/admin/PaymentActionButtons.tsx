"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type Props = {
  paymentId: string;
};

/**
 * Confirm/reject buttons for a pending uploaded payment.
 * Pakai endpoint Step 4: PUT /api/admin/payments/[id]/confirm or /reject.
 */
export function PaymentActionButtons({ paymentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const confirm = async () => {
    setLoading("confirm");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: "PUT",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal konfirmasi");
        return;
      }
      showToast.success("Pembayaran dikonfirmasi", "Booking sekarang aktif");
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 3) {
      showToast.error("Alasan minimal 3 karakter");
      return;
    }
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal reject");
        return;
      }
      showToast.success("Pembayaran ditolak");
      setRejectMode(false);
      setReason("");
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  if (rejectMode) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan penolakan..."
          className="h-9 px-3 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="h-9 flex-1"
            onClick={() => {
              setRejectMode(false);
              setReason("");
            }}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            className="h-9 flex-1"
            onClick={reject}
            disabled={loading === "reject"}
          >
            {loading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Konfirmasi Tolak"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        className="h-9 flex-1"
        onClick={confirm}
        disabled={!!loading}
      >
        {loading === "confirm" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Konfirmasi
          </span>
        )}
      </Button>
      <Button
        variant="destructive"
        className="h-9 flex-1"
        onClick={() => setRejectMode(true)}
        disabled={!!loading}
      >
        <span className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4" /> Tolak
        </span>
      </Button>
    </div>
  );
}
