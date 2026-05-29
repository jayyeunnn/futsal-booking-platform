"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type Props = {
  bookingId: string;
  status: string;
};

/**
 * Admin booking row actions.
 * - PENDING_PAYMENT / PENDING_CONFIRMATION → Confirm or Reject (with reason)
 * - Other statuses → no actions
 */
export function BookingActionButtons({ bookingId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const canAct = ["PENDING_PAYMENT", "PENDING_CONFIRMATION"].includes(status);
  if (!canAct) return null;

  const confirm = async () => {
    setLoading("confirm");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/confirm`, {
        method: "PUT",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal konfirmasi");
        return;
      }
      showToast.success("Booking dikonfirmasi");
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
      const res = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal reject");
        return;
      }
      showToast.success("Booking direject");
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
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan..."
          className="h-7 px-2 text-xs rounded border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary/30 w-32"
          autoFocus
        />
        <Button
          variant="destructive"
          className="h-7 px-2 text-xs"
          onClick={reject}
          disabled={loading === "reject"}
        >
          {loading === "reject" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "OK"
          )}
        </Button>
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => {
            setRejectMode(false);
            setReason("");
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="default"
        className="h-7 px-2.5 text-xs"
        onClick={confirm}
        disabled={!!loading}
      >
        {loading === "confirm" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Confirm
          </span>
        )}
      </Button>
      <Button
        variant="destructive"
        className="h-7 px-2.5 text-xs"
        onClick={() => setRejectMode(true)}
        disabled={!!loading}
      >
        Reject
      </Button>
    </div>
  );
}
