"use client";

import { Search, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Suggestion = {
  id: string;
  name: string;
  city: string;
  address: string;
};

type Props = {
  locale: string;
  initialValue: string;
};

/**
 * Search field dengan dua mode:
 *   1. Auto-suggest dropdown saat ngetik 2+ karakter — fast click ke
 *      lokasi spesifik tanpa scroll list panjang.
 *   2. Submit (Enter atau debounce 300ms) — push ke URL `?search=...`
 *      supaya server component re-render dengan filter terpasang.
 */
export function BookingLocationSearch({ locale, initialValue }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce push URL filter — server filter tetap jalan kalau user tekan Enter atau idle 300ms.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const trimmed = value.trim();
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Fetch suggestions saat value 2+ char.
  useEffect(() => {
    if (suggestRef.current) clearTimeout(suggestRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    suggestRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations/suggest?q=${encodeURIComponent(trimmed)}`,
        );
        const json = await res.json();
        if (json.success) setSuggestions(json.data ?? []);
      } catch {
        // Silent — search field tetap usable tanpa suggest.
      }
    }, 200);
    return () => {
      if (suggestRef.current) clearTimeout(suggestRef.current);
    };
  }, [value]);

  // Close dropdown saat klik di luar.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      const picked = suggestions[highlightIdx];
      router.push(`/${locale}/booking/${picked.id}`);
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const placeholder =
    locale === "en" ? "Search location or city..." : "Cari lokasi atau kota...";

  return (
    <div ref={containerRef} className="relative mb-8">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary z-10" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setShowDropdown(true);
          setHighlightIdx(-1);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKey}
        className="w-full h-12 pl-12 pr-12 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        // role="combobox" + aria-expanded supaya screen reader tau ini
        // input dengan dropdown suggestion (a11y).
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown && suggestions.length > 0}
        aria-controls="location-suggestions"
      />
      {isPending && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
          {locale === "en" ? "Loading..." : "Memuat..."}
        </span>
      )}

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-20"
        >
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={highlightIdx === i}>
              <Link
                href={`/${locale}/booking/${s.id}`}
                onMouseEnter={() => setHighlightIdx(i)}
                onClick={() => setShowDropdown(false)}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  highlightIdx === i ? "bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {s.city} · {s.address}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
