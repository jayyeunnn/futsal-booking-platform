"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { DebouncedSearch } from "@/components/shared/DebouncedSearch";

type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  searchPlaceholder?: string;
  /** Optional select filter (e.g. status, tier). */
  select?: {
    paramName: string;
    options: SelectOption[];
    /** Empty value option label, e.g. "Semua status". */
    allLabel: string;
  };
};

/**
 * Combined search + select filter bar untuk admin list pages.
 * Both controls update URL params instantly (search debounced, select on change).
 * Pagination otomatis reset ke page 1 saat filter berubah.
 */
export function AdminFilterBar({
  searchPlaceholder = "Cari...",
  select,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!select) return;
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set(select.paramName, e.target.value);
    } else {
      params.delete(select.paramName);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
      <DebouncedSearch placeholder={searchPlaceholder} />
      {select && (
        <select
          value={searchParams.get(select.paramName) ?? ""}
          onChange={onSelectChange}
          disabled={pending}
          className="h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <option value="">{select.allLabel}</option>
          {select.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
