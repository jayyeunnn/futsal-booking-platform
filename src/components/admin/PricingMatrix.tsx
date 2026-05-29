"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/shared/Tooltip";
import { showToast } from "@/lib/toast";

type DayType = "WEEKDAY" | "WEEKEND";
type TimeType = "REGULAR" | "PRIME_TIME";

type Row = {
  id?: string;
  dayType: DayType;
  timeType: TimeType;
  startHour: string;
  endHour: string;
  pricePerHour: string;
  isActive: boolean;
};

type Props = {
  courtId: string;
  initialRows: Row[];
};

const DAY_TYPE_LABEL: Record<DayType, string> = {
  WEEKDAY: "Senin - Jumat",
  WEEKEND: "Sabtu - Minggu",
};

const TIME_TYPE_LABEL: Record<TimeType, string> = {
  REGULAR: "Regular",
  PRIME_TIME: "Prime Time",
};

const formatRupiahInput = (n: string) => {
  const num = parseInt(n.replace(/\D/g, ""), 10);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("id-ID");
};

const parseRupiahInput = (s: string) => s.replace(/\D/g, "");

/**
 * Pricing matrix editor for a court.
 * Admin sees all 4 (dayType × timeType) combinations as rows in a table.
 * Saves all rows in one PUT call (replace strategy).
 *
 * Default 4 rows kalau court belum ada pricing — supaya admin tidak harus
 * create dari kosong.
 */
const DEFAULT_ROWS: Row[] = [
  {
    dayType: "WEEKDAY",
    timeType: "REGULAR",
    startHour: "08:00",
    endHour: "16:00",
    pricePerHour: "",
    isActive: true,
  },
  {
    dayType: "WEEKDAY",
    timeType: "PRIME_TIME",
    startHour: "16:00",
    endHour: "00:00",
    pricePerHour: "",
    isActive: true,
  },
  {
    dayType: "WEEKEND",
    timeType: "REGULAR",
    startHour: "08:00",
    endHour: "16:00",
    pricePerHour: "",
    isActive: true,
  },
  {
    dayType: "WEEKEND",
    timeType: "PRIME_TIME",
    startHour: "16:00",
    endHour: "00:00",
    pricePerHour: "",
    isActive: true,
  },
];

export function PricingMatrix({ courtId, initialRows }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    initialRows.length > 0 ? initialRows : DEFAULT_ROWS
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRow = <K extends keyof Row>(
    index: number,
    key: K,
    value: Row[K]
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    );
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        dayType: "WEEKDAY",
        timeType: "REGULAR",
        startHour: "08:00",
        endHour: "16:00",
        pricePerHour: "",
        isActive: true,
      },
    ]);
  };

  const onSave = async () => {
    setError(null);

    // Client-side validation
    for (const r of rows) {
      if (!r.pricePerHour) {
        setError(
          `Harga wajib diisi untuk ${DAY_TYPE_LABEL[r.dayType]} - ${TIME_TYPE_LABEL[r.timeType]}`
        );
        return;
      }
      if (r.startHour >= r.endHour) {
        // Allow "00:00" sebagai end-of-day setelah midnight wrap.
        // PRD bilang jam tutup 00:00 = midnight, jadi treatment khusus:
        if (r.endHour !== "00:00") {
          setError(
            `Jam akhir harus setelah jam mulai (${DAY_TYPE_LABEL[r.dayType]} ${TIME_TYPE_LABEL[r.timeType]})`
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        rows: rows.map((r) => ({
          dayType: r.dayType,
          timeType: r.timeType,
          startHour: r.startHour,
          endHour: r.endHour,
          pricePerHour: parseInt(r.pricePerHour.replace(/\D/g, ""), 10) || 0,
          isActive: r.isActive,
        })),
      };

      const res = await fetch(`/api/admin/pricing/${courtId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal menyimpan harga";
        setError(msg);
        showToast.error(msg);
        return;
      }
      showToast.success("Harga berhasil disimpan");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-text-secondary text-xs uppercase">
                <th className="px-4 py-3 font-medium">Hari</th>
                <th className="px-4 py-3 font-medium">Jenis Waktu</th>
                <th className="px-4 py-3 font-medium">Jam Mulai</th>
                <th className="px-4 py-3 font-medium">Jam Selesai</th>
                <th className="px-4 py-3 font-medium">Harga / Jam</th>
                <th className="px-4 py-3 font-medium text-center">Aktif</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <select
                      value={row.dayType}
                      onChange={(e) =>
                        updateRow(i, "dayType", e.target.value as DayType)
                      }
                      className="h-9 px-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="WEEKDAY">Weekday</option>
                      <option value="WEEKEND">Weekend</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.timeType}
                      onChange={(e) =>
                        updateRow(i, "timeType", e.target.value as TimeType)
                      }
                      className="h-9 px-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="REGULAR">Regular</option>
                      <option value="PRIME_TIME">Prime Time</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={row.startHour}
                      onChange={(e) =>
                        updateRow(i, "startHour", e.target.value)
                      }
                      className="h-9 px-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={row.endHour}
                      onChange={(e) => updateRow(i, "endHour", e.target.value)}
                      className="h-9 px-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatRupiahInput(row.pricePerHour)}
                        onChange={(e) =>
                          updateRow(
                            i,
                            "pricePerHour",
                            parseRupiahInput(e.target.value)
                          )
                        }
                        placeholder="150000"
                        className="h-9 pl-7 pr-2 rounded border border-border bg-surface text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      onChange={(e) =>
                        updateRow(i, "isActive", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Tooltip content="Hapus baris">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="p-1.5 rounded text-error hover:bg-error/10"
                        aria-label="Hapus baris"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs"
            onClick={addRow}
          >
            <Plus className="h-3 w-3 mr-1" /> Tambah Baris
          </Button>
          <p className="text-xs text-text-secondary">
            {rows.length} baris harga
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-info/5 border border-info/20 text-xs text-text-secondary">
        <span>
          <strong>Tip:</strong> 4 kombinasi standar sesuai PRD adalah
          (Weekday/Weekend) × (Regular 08:00-16:00 / Prime Time 16:00-00:00).
          Pakai <code>00:00</code> untuk tengah malam (end-of-day).
        </span>
      </div>

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
