"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSED";

type Props = {
  refundId: string;
  status: RefundStatus;
  /** When false, only display-only (e.g. STAFF). */
  isAdmin: boolean;
};

/**
 * Action panel for an individual refund. Shows different CTAs based on
 * current status:
 *   REQUESTED → Approve / Reject
 *   APPROVED  → Mark as Processed
 *   REJECTED / PROCESSED → no actions (terminal)
 */
export function RefundActionButtons({ refundId, status, isAdmin }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <p className="text-sm text-text-secondary bg-muted p-3 rounded-lg">
        Hanya ADMIN yang dapat memproses refund.
      </p>
    );
  }

  if (status === "REJECTED" || status === "PROCESSED") {
    return (
      <p className="text-sm text-text-secondary bg-muted p-3 rounded-lg">
        Refund sudah {status === "PROCESSED" ? "diproses" : "ditolak"} dan
        tidak dapat diubah.
      </p>
    );
  }

  const callAction = async (
    action: "approve" | "reject" | "process",
    body?: object
  ) => {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Aksi gagal");
        return;
      }
      router.refresh();
      setRejectMode(false);
      setRejectReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aksi gagal");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {status === "REQUESTED" && !rejectMode && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            className="h-10 flex-1"
            onClick={() => callAction("approve")}
            disabled={!!loading}
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Approve
              </span>
            )}
          </Button>
          <Button
            variant="destructive"
            className="h-10 flex-1"
            onClick={() => setRejectMode(true)}
            disabled={!!loading}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      )}

      {status === "REQUESTED" && rejectMode && (
        <div className="space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Alasan penolakan (min 5 karakter)"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="h-10 flex-1"
              onClick={() => {
                setRejectMode(false);
                setRejectReason("");
                setError(null);
              }}
              disabled={!!loading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="h-10 flex-1"
              onClick={() => callAction("reject", { reason: rejectReason })}
              disabled={!!loading || rejectReason.trim().length < 5}
            >
              {loading === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Konfirmasi Tolak"
              )}
            </Button>
          </div>
        </div>
      )}

      {status === "APPROVED" && (
        <Button
          variant="default"
          className="h-10 w-full"
          onClick={() => callAction("process")}
          disabled={!!loading}
        >
          {loading === "process" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Tandai Sudah Ditransfer
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
