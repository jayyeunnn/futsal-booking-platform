"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, Trash2, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/shared/Tooltip";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { showToast } from "@/lib/toast";

type Props = {
  rewardId: string;
  isActive: boolean;
  locale: string;
  redemptionCount: number;
};

/**
 * Inline actions untuk reward row: edit link, toggle aktif, smart delete.
 * Hard delete kalau redemptionCount=0, soft delete (isActive=false) kalau ada history.
 */
export function RewardActionButtons({
  rewardId,
  isActive,
  locale,
  redemptionCount,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const toggle = async () => {
    setLoading("toggle");
    try {
      const res = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal update");
        return;
      }
      showToast.success(
        isActive ? "Reward dinonaktifkan" : "Reward diaktifkan"
      );
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  const onDelete = async () => {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal hapus");
        return;
      }
      showToast.success(
        json.data?.mode === "soft" ? "Reward dinonaktifkan" : "Reward dihapus"
      );
      setDeleteOpen(false);
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Edit">
          <Link
            href={`/${locale}/admin/rewards/${rewardId}/edit`}
            className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-primary/10"
            aria-label="Edit reward"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Tooltip>

        <Tooltip content={isActive ? "Nonaktifkan" : "Aktifkan"}>
          <button
            onClick={toggle}
            disabled={!!loading}
            className={`p-1.5 rounded hover:bg-muted ${
              isActive ? "text-success" : "text-text-secondary"
            } disabled:opacity-50`}
            aria-label="Toggle active"
          >
            {loading === "toggle" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
          </button>
        </Tooltip>

        <Tooltip
          content={redemptionCount === 0 ? "Hapus" : "Hapus (soft)"}
        >
          <button
            onClick={() => setDeleteOpen(true)}
            disabled={!!loading}
            className="p-1.5 rounded text-error hover:bg-error/10 disabled:opacity-50"
            aria-label="Hapus reward"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Hapus reward?"
        description={
          redemptionCount === 0
            ? "Reward ini belum pernah ditukar, akan dihapus permanen."
            : `Reward ini sudah ditukar ${redemptionCount}x. Akan di-soft-delete (nonaktif, history redemption tetap aman).`
        }
        variant="danger"
        confirmLabel="Hapus"
        loading={loading === "delete"}
      />
    </>
  );
}
