"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  memberId: string;
  currentPoints: number;
};

/**
 * Admin tool to manually credit/debit member points.
 * Posts to /api/admin/members/[id]/adjust-points.
 */
export function AdjustPointsForm({ memberId, currentPoints }: Props) {
  const router = useRouter();
  const [direction, setDirection] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsed = parseInt(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setFeedback({ kind: "err", message: "Jumlah harus angka positif" });
      return;
    }

    const signed = direction === "add" ? parsed : -parsed;
    if (currentPoints + signed < 0) {
      setFeedback({
        kind: "err",
        message: `Tidak cukup poin. Saldo saat ini: ${currentPoints}`,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}/adjust-points`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: signed, reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({
          kind: "err",
          message: json?.error?.message ?? "Gagal mengubah poin",
        });
        return;
      }
      const upgraded = json.data.tierUpgraded
        ? ` Tier naik ke ${json.data.tier}.`
        : "";
      setFeedback({
        kind: "ok",
        message: `Poin berhasil diubah. Saldo baru: ${json.data.totalPoints}.${upgraded}`,
      });
      setAmount("");
      setReason("");
      router.refresh();
    } catch (err) {
      setFeedback({
        kind: "err",
        message: err instanceof Error ? err.message : "Gagal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface border border-border rounded-xl p-5 space-y-4"
    >
      <h3 className="font-heading font-semibold text-text-primary">
        Adjust Poin
      </h3>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm ${
            feedback.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection("add")}
          className={`flex-1 h-10 rounded-lg text-sm font-medium border flex items-center justify-center gap-1 ${
            direction === "add"
              ? "bg-success/10 border-success text-success"
              : "border-border text-text-secondary"
          }`}
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
        <button
          type="button"
          onClick={() => setDirection("deduct")}
          className={`flex-1 h-10 rounded-lg text-sm font-medium border flex items-center justify-center gap-1 ${
            direction === "deduct"
              ? "bg-error/10 border-error text-error"
              : "border-border text-text-secondary"
          }`}
        >
          <Minus className="h-4 w-4" /> Kurangi
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">
          Jumlah poin
        </label>
        <input
          type="number"
          min={1}
          max={10000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">
          Alasan
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={3}
          maxLength={255}
          rows={2}
          placeholder="Cth: Kompensasi keluhan booking 12/05"
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      <Button
        type="submit"
        variant="cta"
        className="w-full h-10"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
      </Button>
    </form>
  );
}
