"use client";

import { Star } from "lucide-react";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  /** Compact non-interactive rendering */
  size?: "sm" | "md" | "lg";
  /** Read-only when no onChange. */
};

const SIZE_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

/**
 * 5-star rating widget. Read-only when `onChange` is omitted.
 */
export function StarRating({ value, onChange, size = "md" }: Props) {
  const cls = SIZE_CLASS[size];
  const interactive = typeof onChange === "function";
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const Icon = (
          <Star
            className={`${cls} ${
              filled ? "fill-warning text-warning" : "text-text-secondary/40"
            } transition-colors`}
          />
        );
        return interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange!(n)}
            aria-label={`${n} bintang`}
            className="p-0.5 hover:scale-110 transition-transform"
          >
            {Icon}
          </button>
        ) : (
          <span key={n}>{Icon}</span>
        );
      })}
    </div>
  );
}
