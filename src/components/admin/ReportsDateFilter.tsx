"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const PRESETS: Array<{ label: string; days: number }> = [
  { label: "7 Hari", days: 7 },
  { label: "30 Hari", days: 30 },
  { label: "90 Hari", days: 90 },
  { label: "1 Tahun", days: 365 },
];

function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  /** ISO date strings (yyyy-MM-dd) currently active. */
  from: string;
  to: string;
};

/**
 * Date range filter for the admin reports page.
 *
 * Two date inputs + 4 preset buttons. All controls update the URL via
 * `router.replace` so the page server component re-renders with fresh data.
 */
export function ReportsDateFilter({ from, to }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const updateRange = (nextFrom: string, nextTo: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("from", nextFrom);
    params.set("to", nextTo);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const onPreset = (days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    updateRange(formatDateOnly(start), formatDateOnly(today));
  };

  const onFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRange(e.target.value, to);
  };
  const onToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRange(from, e.target.value);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary font-medium">
            Dari
          </label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={onFromChange}
            disabled={pending}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary font-medium">
            Sampai
          </label>
          <input
            type="date"
            value={to}
            min={from}
            onChange={onToChange}
            disabled={pending}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        <span className="text-xs text-text-secondary font-medium">Preset:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() => onPreset(preset.days)}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
        {pending && (
          <span className="text-xs text-text-secondary">Memuat…</span>
        )}
      </div>
    </div>
  );
}
