"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { celebrateBig } from "@/lib/confetti";
import type { Reward } from "@/lib/rewards";

type Props = {
  reward: Reward;
  userPoints: number;
};

/**
 * Single reward card. Handles confirm dialog + POST to /api/members/redeem.
 * On success, refreshes the parent server component so balance + active
 * redemption list update.
 */
export function RewardCard({ reward, userPoints }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAfford = userPoints >= reward.pointsCost;

  const onRedeem = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/members/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardKey: reward.key }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal menukar reward";
        setError(msg);
        showToast.error("Penukaran gagal", msg);
        return;
      }
      setConfirm(false);

      // Celebrate the redemption — kode tampil + confetti.
      const code = json.data?.redemption?.discountCode;
      celebrateBig();
      showToast.success(
        `Reward ditukar! 🎉`,
        code ? `Kode: ${code}` : "Klaim di lokasi"
      );

      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menukar reward";
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-muted/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-text-primary text-sm line-clamp-2">
            {reward.name}
          </p>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
            {reward.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-cta">
        <Coins className="h-4 w-4" />
        <span className="text-lg font-heading font-bold">
          {reward.pointsCost.toLocaleString("id-ID")}
        </span>
        <span className="text-xs text-text-secondary">poin</span>
      </div>

      {confirm ? (
        <div className="space-y-2">
          {error && (
            <p className="text-xs text-error bg-error/10 p-2 rounded">{error}</p>
          )}
          <p className="text-xs text-text-secondary">
            Tukar {reward.pointsCost.toLocaleString("id-ID")} poin untuk reward
            ini?
          </p>
          <div className="flex gap-2">
            <Button
              variant="cta"
              className="flex-1 h-9 text-xs"
              onClick={onRedeem}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ya, Tukar"}
            </Button>
            <Button
              variant="ghost"
              className="h-9 text-xs"
              onClick={() => {
                setConfirm(false);
                setError(null);
              }}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant={canAfford ? "default" : "ghost"}
          className="h-9 text-xs"
          disabled={!canAfford}
          onClick={() => setConfirm(true)}
        >
          {canAfford ? (
            "Tukar Sekarang"
          ) : (
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Kurang {(reward.pointsCost - userPoints).toLocaleString("id-ID")}{" "}
              poin
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
