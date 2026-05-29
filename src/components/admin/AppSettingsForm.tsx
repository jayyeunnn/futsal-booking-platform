"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import type { AppSettingsInput } from "@/lib/validations/settings";

type Props = {
  initial: AppSettingsInput;
};

type FieldDef = {
  key: keyof AppSettingsInput;
  label: string;
  hint: string;
  suffix?: string;
  min?: number;
  max?: number;
};

const SECTIONS: Array<{
  title: string;
  description: string;
  fields: FieldDef[];
}> = [
  {
    title: "Pembayaran",
    description: "Konfigurasi DP & batas waktu transfer",
    fields: [
      {
        key: "dp_percentage",
        label: "Persentase DP",
        hint: "Berapa persen total booking yang ditagihkan saat DP. Sisanya dibayar di tempat.",
        suffix: "%",
        min: 10,
        max: 100,
      },
      {
        key: "payment_deadline_minutes",
        label: "Batas Waktu Pembayaran",
        hint: "Berapa menit user punya waktu untuk upload bukti transfer sebelum booking expired.",
        suffix: "menit",
        min: 15,
        max: 1440,
      },
    ],
  },
  {
    title: "Kebijakan Refund",
    description:
      "Berapa persen DP dikembalikan tergantung kapan booking dibatalkan",
    fields: [
      {
        key: "refund_policy_h1",
        label: "H-1 (>24 jam)",
        hint: "Refund kalau dibatalkan minimal 24 jam sebelum jadwal.",
        suffix: "%",
        min: 0,
        max: 100,
      },
      {
        key: "refund_policy_same_day_3h",
        label: "Hari H, >3 jam",
        hint: "Refund kalau dibatalkan hari H tapi masih >3 jam sebelum jadwal.",
        suffix: "%",
        min: 0,
        max: 100,
      },
      {
        key: "refund_policy_less_3h",
        label: "<3 jam",
        hint: "Refund kalau dibatalkan kurang dari 3 jam sebelum jadwal. Biasanya 0%.",
        suffix: "%",
        min: 0,
        max: 100,
      },
    ],
  },
  {
    title: "Sistem Poin",
    description: "Berapa poin user dapat dari aktivitas tertentu",
    fields: [
      {
        key: "points_per_hour",
        label: "Per Jam Booking",
        hint: "Poin yang didapat per jam booking yang selesai.",
        suffix: "poin",
        min: 0,
      },
      {
        key: "points_review",
        label: "Submit Review",
        hint: "Bonus poin untuk submit review setelah booking selesai.",
        suffix: "poin",
        min: 0,
      },
      {
        key: "points_referral",
        label: "Referral",
        hint: "Bonus poin untuk referral yang menyelesaikan booking pertama.",
        suffix: "poin",
        min: 0,
      },
      {
        key: "points_bonus_off_peak",
        label: "Bonus Off-Peak",
        hint: "Bonus tambahan untuk booking di jam sepi (08:00-16:00).",
        suffix: "poin",
        min: 0,
      },
    ],
  },
];

export function AppSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AppSettingsInput>(initial);
  const [saving, setSaving] = useState(false);

  const update = (key: keyof AppSettingsInput, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal menyimpan");
        return;
      }
      showToast.success("Settings tersimpan");
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => (
        <div
          key={section.title}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <div className="mb-4">
            <h2 className="font-heading font-semibold text-text-primary">
              {section.title}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {section.description}
            </p>
          </div>

          <div className="space-y-4">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:items-start"
              >
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-0.5">
                    {field.label}
                  </label>
                  <p className="text-xs text-text-secondary flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    {field.hint}
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step="1"
                    value={form[field.key] ?? 0}
                    onChange={(e) =>
                      update(field.key, parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full h-10 pl-3 pr-14 rounded-lg border border-border bg-surface text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  {field.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-medium pointer-events-none">
                      {field.suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          variant="cta"
          className="h-10 px-6"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Simpan Semua
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
