"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/shared/Tooltip";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { showToast } from "@/lib/toast";

type Props = {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
  locale: string;
};

/**
 * Inline actions for admin user row.
 * - Self-edit allowed (link only) but deactivate is server-blocked.
 * - Deactivate uses ConfirmDialog karena dampaknya signifikan.
 */
export function AdminUserActionButtons({
  userId,
  isActive,
  isSelf,
  locale,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onDeactivate = async () => {
    setLoading("deactivate");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal menonaktifkan user");
        return;
      }
      showToast.success("User dinonaktifkan");
      setConfirmOpen(false);
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  const onReactivate = async () => {
    setLoading("activate");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal mengaktifkan");
        return;
      }
      showToast.success("User diaktifkan");
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
            href={`/${locale}/admin/users/${userId}/edit`}
            className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-primary/10"
            aria-label="Edit user"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Tooltip>

        {isActive ? (
          <Tooltip content={isSelf ? "Tidak bisa nonaktif diri sendiri" : "Nonaktifkan"}>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!!loading || isSelf}
              className="p-1.5 rounded text-error hover:bg-error/10 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Nonaktifkan user"
            >
              <Power className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Aktifkan">
            <button
              onClick={onReactivate}
              disabled={!!loading}
              className="p-1.5 rounded text-success hover:bg-success/10 disabled:opacity-50"
              aria-label="Aktifkan user"
            >
              {loading === "activate" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}
            </button>
          </Tooltip>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDeactivate}
        title="Nonaktifkan user?"
        description="User tidak akan bisa login lagi. Data history (booking, refund, dll) tetap utuh. Bisa diaktifkan kembali nanti."
        variant="danger"
        confirmLabel="Nonaktifkan"
        loading={loading === "deactivate"}
      />
    </>
  );
}
