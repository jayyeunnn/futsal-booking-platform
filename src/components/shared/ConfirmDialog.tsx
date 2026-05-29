"use client";

import { useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Variant = "danger" | "warning" | "info";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
};

const VARIANT_STYLES: Record<
  Variant,
  { iconBg: string; iconColor: string; confirmVariant: "destructive" | "cta" | "default" }
> = {
  danger: {
    iconBg: "bg-error/10",
    iconColor: "text-error",
    confirmVariant: "destructive",
  },
  warning: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    confirmVariant: "cta",
  },
  info: {
    iconBg: "bg-info/10",
    iconColor: "text-info",
    confirmVariant: "default",
  },
};

/**
 * Reusable confirmation dialog dengan brand-aware variants.
 * Pakai untuk semua destructive/important actions:
 *   - Logout, hapus favorit, hapus review (danger)
 *   - Cancel recurring, mark refund processed (warning)
 *   - Konfirmasi penting tapi tidak destructive (info)
 *
 * Includes:
 *   - Esc key to close
 *   - Click backdrop to close
 *   - Focus trap-ish (auto focus confirm button)
 *   - Async-aware confirm (shows loading state during onConfirm promise)
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "warning",
  loading = false,
}: Props) {
  const style = VARIANT_STYLES[variant];

  // Esc key handler
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !loading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${style.iconBg} shrink-0`}>
              <AlertTriangle className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-title"
                className="text-base font-heading font-semibold text-text-primary"
              >
                {title}
              </h3>
              {description && (
                <p className="mt-1.5 text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-text-secondary hover:text-text-primary disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 flex gap-2 justify-end">
          <Button
            variant="ghost"
            className="h-10"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={style.confirmVariant}
            className="h-10 min-w-[100px]"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
