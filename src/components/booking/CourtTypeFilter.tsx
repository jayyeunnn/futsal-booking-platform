"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Props = {
  locale: string;
  current: "ALL" | "INDOOR" | "OUTDOOR";
};

/**
 * Indoor/Outdoor filter. Uses URL `?type=` so filter state survives reloads
 * and the page can stay a server component.
 */
export function CourtTypeFilter({ locale, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const labels = {
    en: { ALL: "All", INDOOR: "Indoor", OUTDOOR: "Outdoor" },
    id: { ALL: "Semua", INDOOR: "Indoor", OUTDOOR: "Outdoor" },
  } as const;
  const lang = locale === "en" ? labels.en : labels.id;

  const set = (next: "ALL" | "INDOOR" | "OUTDOOR") => {
    const params = new URLSearchParams(searchParams);
    if (next === "ALL") params.delete("type");
    else params.set("type", next);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const types: Array<"ALL" | "INDOOR" | "OUTDOOR"> = ["ALL", "INDOOR", "OUTDOOR"];

  return (
    <div className="flex gap-2 mb-8">
      {types.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => set(type)}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
            current === type
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary border border-border hover:bg-muted"
          }`}
        >
          {lang[type]}
        </button>
      ))}
    </div>
  );
}
