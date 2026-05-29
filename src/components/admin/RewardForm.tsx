"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type RewardType =
  | "DISCOUNT_PERCENT"
  | "DISCOUNT_AMOUNT"
  | "FREE_SESSION"
  | "MERCHANDISE";
type Tier = "BRONZE" | "SILVER" | "GOLD";

type FormState = {
  code: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  pointsCost: string;
  type: RewardType;
  value: string;
  validForDays: string;
  minTier: Tier | "";
  isActive: boolean;
  sortOrder: string;
};

type Props = {
  locale: string;
  rewardId?: string;
  defaultValues?: Partial<FormState>;
  /** When editing, indicates how many redemptions reference this code (for warning). */
  redemptionCount?: number;
};

const empty: FormState = {
  code: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  pointsCost: "100",
  type: "DISCOUNT_PERCENT",
  value: "10",
  validForDays: "60",
  minTier: "",
  isActive: true,
  sortOrder: "0",
};

const TYPE_HINTS: Record<RewardType, { unit: string; help: string }> = {
  DISCOUNT_PERCENT: {
    unit: "%",
    help: "Nilai 1-100. Contoh: 10 = potongan 10% dari total booking.",
  },
  DISCOUNT_AMOUNT: {
    unit: "Rp",
    help: "Nominal rupiah. Min 1.000. Contoh: 50000 = potong Rp 50rb.",
  },
  FREE_SESSION: {
    unit: "jam",
    help: "Jumlah jam free. Min 1, max 12.",
  },
  MERCHANDISE: {
    unit: "—",
    help: "Tidak digunakan untuk diskon. Set 1. User klaim manual di lokasi.",
  },
};

/**
 * Reusable reward form for create + edit. Pakai rewardId=undefined untuk create.
 */
export function RewardForm({
  locale,
  rewardId,
  defaultValues,
  redemptionCount = 0,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ ...empty, ...defaultValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        code: form.code,
        name: form.name,
        nameEn: form.nameEn || undefined,
        description: form.description || undefined,
        descriptionEn: form.descriptionEn || undefined,
        pointsCost: parseInt(form.pointsCost, 10),
        type: form.type,
        value: parseInt(form.value, 10),
        validForDays: parseInt(form.validForDays, 10) || 60,
        minTier: form.minTier || null,
        isActive: form.isActive,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      };

      const url = rewardId
        ? `/api/admin/rewards/${rewardId}`
        : "/api/admin/rewards";
      const res = await fetch(url, {
        method: rewardId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal menyimpan reward";
        setError(msg);
        showToast.error(msg);
        return;
      }

      showToast.success(
        rewardId ? "Reward diperbarui" : "Reward berhasil dibuat"
      );
      router.push(`/${locale}/admin/rewards`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const hint = TYPE_HINTS[form.type];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {rewardId && redemptionCount > 0 && (
        <div className="bg-warning/10 border border-warning/30 text-warning text-sm rounded-lg px-4 py-3">
          Reward ini sudah pernah ditukar {redemptionCount}x. Hindari mengubah
          <strong> kode</strong> — ganti reward lama jadi nonaktif lalu buat baru
          kalau mau perubahan besar.
        </div>
      )}

      {/* Info Dasar */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Info Dasar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Kode <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                update(
                  "code",
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                )
              }
              placeholder="discount_10"
              required
              minLength={3}
              maxLength={50}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              huruf kecil + angka + underscore. Tidak boleh diubah setelah
              ada redemption.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Urutan
            </label>
            <input
              type="number"
              min={0}
              max={9999}
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Urutan tampil di reward store (kecil = duluan).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Nama (ID) <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Diskon 10% (1x booking)"
              required
              minLength={3}
              maxLength={200}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Nama (EN)
            </label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => update("nameEn", e.target.value)}
              placeholder="10% discount (1x booking)"
              maxLength={200}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Deskripsi (ID)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Potongan 10% di booking berikutnya"
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Deskripsi (EN)
            </label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => update("descriptionEn", e.target.value)}
              placeholder="10% off your next booking"
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Poin & Tipe */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Poin & Tipe Reward
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Biaya Poin <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cta" />
              <input
                type="number"
                min={1}
                value={form.pointsCost}
                onChange={(e) => update("pointsCost", e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Berapa poin yang dipotong dari user saat tukar.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Validity (hari)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={form.validForDays}
              onChange={(e) => update("validForDays", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Berapa hari kode valid setelah ditukar (1-365).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Tipe <span className="text-error">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as RewardType)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="DISCOUNT_PERCENT">Diskon Persentase (%)</option>
              <option value="DISCOUNT_AMOUNT">Diskon Nominal (Rp)</option>
              <option value="FREE_SESSION">Free Session (jam)</option>
              <option value="MERCHANDISE">Merchandise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Nilai <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={form.value}
                onChange={(e) => update("value", e.target.value)}
                required
                disabled={form.type === "MERCHANDISE"}
                className="w-full h-10 px-3 pr-12 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-medium">
                {hint.unit}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">{hint.help}</p>
          </div>
        </div>
      </div>

      {/* Eligibilitas & Status */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Eligibilitas & Status
        </h2>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Tier Minimum
          </label>
          <select
            value={form.minTier}
            onChange={(e) => update("minTier", e.target.value as Tier | "")}
            className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua tier (BRONZE+)</option>
            <option value="BRONZE">BRONZE+</option>
            <option value="SILVER">SILVER+</option>
            <option value="GOLD">GOLD only</option>
          </select>
          <p className="text-[11px] text-text-secondary mt-1">
            Set kalau reward khusus member tier tertentu.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-border">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">Aktif</span>
            <p className="text-xs text-text-secondary">
              Uncheck untuk sembunyikan dari reward store tanpa hapus data.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => router.push(`/${locale}/admin/rewards`)}
          disabled={saving}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="cta"
          className="h-10 px-6"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {rewardId ? "Simpan Perubahan" : "Buat Reward"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
