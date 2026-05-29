"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Tooltip } from "@/components/shared/Tooltip";
import { showToast } from "@/lib/toast";

type Props = {
  recurringId: string;
  isActive: boolean;
};

/**
 * Pause/resume + cancel controls for a recurring booking template.
 * Cancellation is soft (sets isActive=false + endDate=now), preserving
 * history and any future generated bookings the user may still pay for.
 */
export function RecurringBookingActions({ recurringId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const togglePause = async () => {
    setLoading("toggle");
    try {
      const res = await fetch(`/api/recurring-bookings/${recurringId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal update");
        return;
      }
      showToast.success(isActive ? "Recurring di-pause" : "Recurring diaktifkan");
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal update");
    } finally {
      setLoading(null);
    }
  };

  const cancel = async () => {
    setLoading("cancel");
    try {
      const res = await fetch(`/api/recurring-bookings/${recurringId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal cancel");
        return;
      }
      showToast.success("Recurring dibatalkan");
      setConfirmOpen(false);
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal cancel");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Tooltip content={isActive ? "Pause recurring" : "Aktifkan kembali"}>
          <Button
            variant="ghost"
            className="h-9 px-3 flex-1 text-xs"
            onClick={togglePause}
            disabled={!!loading}
            aria-label={isActive ? "Pause recurring" : "Aktifkan recurring"}
          >
            {loading === "toggle" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isActive ? (
              <span className="flex items-center gap-1">
                <Pause className="h-3 w-3" /> Pause
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Play className="h-3 w-3" /> Resume
              </span>
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Batalkan recurring permanen">
          <Button
            variant="destructive"
            className="h-9 px-3 flex-1 text-xs"
            onClick={() => setConfirmOpen(true)}
            disabled={!!loading}
            aria-label="Batalkan recurring"
          >
            <X className="h-3 w-3 mr-1" /> Cancel
          </Button>
        </Tooltip>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={cancel}
        title="Batalkan booking berulang?"
        description="Booking yang sudah ter-generate untuk minggu depan tetap aktif. Hanya template recurring yang dibatalkan."
        variant="warning"
        confirmLabel="Ya, batalkan"
        cancelLabel="Tidak"
        loading={loading === "cancel"}
      />
    </>
  );
}
