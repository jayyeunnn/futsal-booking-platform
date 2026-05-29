"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { showToast } from "@/lib/toast";
import { celebrateSmall } from "@/lib/confetti";

type Props = {
  bookingId: string;
};

/**
 * Inline review form rendered on booking detail when status=COMPLETED
 * and no review exists yet. Submits to POST /api/reviews and awards
 * +5 review points server-side.
 */
export function ReviewForm({ bookingId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (rating < 1) {
      setFeedback({ kind: "err", message: "Pilih rating dulu (1-5 bintang)" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment: comment || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal kirim review";
        setFeedback({ kind: "err", message: msg });
        showToast.error("Review gagal dikirim", msg);
        return;
      }
      setFeedback({
        kind: "ok",
        message: "Terima kasih! Kamu mendapat +5 poin untuk review ini.",
      });
      celebrateSmall();
      showToast.success("Review terkirim 🎉", "+5 poin sudah ditambahkan");
      setRating(0);
      setComment("");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal kirim review";
      setFeedback({ kind: "err", message: msg });
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface border border-border rounded-xl p-5 space-y-4"
    >
      <div>
        <h2 className="text-sm font-medium text-text-primary mb-1">
          Beri Rating Pengalaman
        </h2>
        <p className="text-xs text-text-secondary">
          Bantu pemain lain dengan ulasan jujur. Dapat +5 poin saat submit.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            feedback.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {feedback.kind === "ok" ? (
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-primary mb-2">
          Rating
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">
          Komentar (opsional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Ceritain pengalaman main di sini..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
        <p className="text-[11px] text-text-secondary mt-1">
          {comment.length} / 1000
        </p>
      </div>

      <Button
        type="submit"
        variant="cta"
        className="w-full h-10"
        disabled={loading || rating < 1}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim Review"}
      </Button>
    </form>
  );
}
