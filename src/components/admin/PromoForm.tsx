"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
type Tier = "BRONZE" | "SILVER" | "GOLD";

type FormState = {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minBooking: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  memberOnly: boolean;
  minTier: Tier | "";
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type Props = {
  locale: string;
  promoId?: string;
  defaultValues?: Partial<FormState>;
};

const empty: FormState = {
  code: "",
  title: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minBooking: "",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  memberOnly: false,
  minTier: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

/**
 * Reusable promo form for both create and edit.
 * Pakai promoId=undefined untuk create mode.
 */
export function PromoForm({ locale, promoId, defaultValues }: Props) {
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
        title: form.title,
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minBooking: form.minBooking ? parseFloat(form.minBooking) : null,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        perUserLimit: parseInt(form.perUserLimit, 10) || 1,
        memberOnly: form.memberOnly,
        minTier: form.minTier || null,
        startDate: form.startDate,
        endDate: form.endDate,
        isActive: form.isActive,
      };

      const url = promoId
        ? `/api/admin/promos/${promoId}`
        : "/api/admin/promos";
      const res = await fetch(url, {
        method: promoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal menyimpan promo";
        setError(msg);
        showToast.error(msg);
        return;
      }

      showToast.success(promoId ? "Promo diperbarui" : "Promo berhasil dibuat");
      router.push(`/${locale}/admin/promos`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ISO date for input[type=datetime-local] — strip seconds + timezone
  const formatForInput = (s: string) => {
    if (!s) return "";
    try {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return "";
      // Local datetime-local format: YYYY-MM-DDTHH:mm
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Info Dasar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Kode Promo <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="JAYFIELD20"
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Z0-9_-]+"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              A-Z, 0-9, underscore, dash. Otomatis uppercase.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Judul <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Diskon 20% Akhir Tahun"
              required
              minLength={3}
              maxLength={200}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Promo akhir tahun untuk semua booking..."
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">Diskon</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Tipe Diskon <span className="text-error">*</span>
            </label>
            <select
              value={form.discountType}
              onChange={(e) =>
                update("discountType", e.target.value as DiscountType)
              }
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Nilai Diskon <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step={form.discountType === "PERCENTAGE" ? "1" : "1000"}
                min={form.discountType === "PERCENTAGE" ? "1" : "0"}
                max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                value={form.discountValue}
                onChange={(e) => update("discountValue", e.target.value)}
                required
                className="w-full h-10 px-3 pr-12 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-medium">
                {form.discountType === "PERCENTAGE" ? "%" : "Rp"}
              </span>
            </div>
          </div>

          {form.discountType === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Maks Diskon (Rp)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={form.maxDiscount}
                onChange={(e) => update("maxDiscount", e.target.value)}
                placeholder="50000"
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-text-secondary mt-1">
                Cap diskon walau persentase besar. Kosongkan = no cap.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Min Booking (Rp)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={form.minBooking}
              onChange={(e) => update("minBooking", e.target.value)}
              placeholder="100000"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Total booking minimum agar promo berlaku.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Periode & Limit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Tanggal Mulai <span className="text-error">*</span>
            </label>
            <input
              type="datetime-local"
              value={formatForInput(form.startDate)}
              onChange={(e) => update("startDate", e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Tanggal Selesai <span className="text-error">*</span>
            </label>
            <input
              type="datetime-local"
              value={formatForInput(form.endDate)}
              onChange={(e) => update("endDate", e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Total Limit Pemakaian
            </label>
            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => update("usageLimit", e.target.value)}
              placeholder="100"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Total pemakaian maksimal lintas semua user. Kosongkan = unlimited.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Limit per User
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.perUserLimit}
              onChange={(e) => update("perUserLimit", e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Berapa kali 1 user boleh pakai promo ini.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Eligibilitas
        </h2>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.memberOnly}
            onChange={(e) => update("memberOnly", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">
              Member Only
            </span>
            <p className="text-xs text-text-secondary">
              Hanya user yang sudah login & terdaftar yang bisa pakai.
            </p>
          </div>
        </label>

        {form.memberOnly && (
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
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-border">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">
              Aktif
            </span>
            <p className="text-xs text-text-secondary">
              Uncheck untuk pause promo tanpa hapus.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => router.push(`/${locale}/admin/promos`)}
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
              {promoId ? "Simpan Perubahan" : "Buat Promo"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
