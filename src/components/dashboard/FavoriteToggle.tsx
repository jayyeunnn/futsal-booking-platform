"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

type Props = {
  courtId: string;
  initialFavorited: boolean;
  /** Optional label rendered next to the icon. */
  label?: string;
  className?: string;
};

/**
 * Heart toggle for favoriting a court. Optimistic update + revalidate.
 */
export function FavoriteToggle({
  courtId,
  initialFavorited,
  label,
  className,
}: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const onToggle = async () => {
    if (loading) return;
    const next = !favorited;
    setFavorited(next);
    setLoading(true);
    try {
      const res = await fetch(
        next ? "/api/members/favorites" : `/api/members/favorites/${courtId}`,
        {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: next ? JSON.stringify({ courtId }) : undefined,
        }
      );
      if (!res.ok) {
        // Revert on failure.
        setFavorited(!next);
      } else {
        router.refresh();
      }
    } catch {
      setFavorited(!next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onToggle}
      disabled={loading}
      aria-label={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
      className={`inline-flex items-center gap-1 transition-colors disabled:opacity-50 ${
        className ?? ""
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-colors ${
            favorited
              ? "fill-error text-error"
              : "text-text-secondary hover:text-error"
          }`}
        />
      )}
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}
