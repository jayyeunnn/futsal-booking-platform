"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Props = {
  reviewId: string;
  isVisible: boolean;
};

/**
 * Inline toggle for moderating a review's visibility.
 * Soft-moderation only — preserves data for audit/appeal.
 */
export function ReviewVisibilityToggle({ reviewId, isVisible }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !isVisible }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Gagal");
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onToggle}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          isVisible
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-error/10 text-error hover:bg-error/20"
        }`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isVisible ? (
          <>
            <Eye className="h-3 w-3" />
            Tampil
          </>
        ) : (
          <>
            <EyeOff className="h-3 w-3" />
            Hidden
          </>
        )}
      </button>
      {error && <p className="text-[10px] text-error">{error}</p>}
    </div>
  );
}
