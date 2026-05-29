"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

type Props = {
  /** URL query param name. Defaults to "search". */
  paramName?: string;
  placeholder?: string;
  /** Debounce delay in ms. Default 350. */
  delay?: number;
  className?: string;
};

/**
 * Search input with URL-driven state and debounce.
 * Updates `?{paramName}=...` query string after typing stops, triggering
 * a server-component re-fetch. Resets pagination to page 1 on new search.
 *
 * Pakai untuk admin pages (members, bookings, refunds, reviews) supaya
 * search instan tanpa harus klik tombol.
 */
export function DebouncedSearch({
  paramName = "search",
  placeholder = "Cari...",
  delay = 350,
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const initial = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(initial);

  // Sync local state when URL param changes externally (back button, etc).
  useEffect(() => {
    setValue(searchParams.get(paramName) ?? "");
  }, [searchParams, paramName]);

  // Debounced URL update.
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get(paramName) ?? "";
      if (value === current) return;

      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set(paramName, value.trim());
      } else {
        params.delete(paramName);
      }
      // Reset pagination on new search.
      params.delete("page");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, delay);

    return () => clearTimeout(handle);
  }, [value, delay, paramName, pathname, router, searchParams]);

  const clear = () => setValue("");

  return (
    <div className={`relative ${className ?? "flex-1"}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      {pending ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary animate-spin" />
      ) : value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
