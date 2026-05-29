"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

type Variant = "dropdown" | "menu";

type Props = {
  /** "dropdown" shows a single icon button that opens a popover with
   *  Light/Dark/System options. "menu" renders the three options inline
   *  (good for mobile drawers). */
  variant?: Variant;
  className?: string;
};

/**
 * Theme switcher with three modes: light, dark, system.
 * Uses lucide icons (Sun, Moon, Monitor) and `useTheme()` to persist
 * the choice. Honors `prefers-reduced-motion` via globals.css transitions.
 */
export default function ThemeToggle({
  variant = "dropdown",
  className,
}: Props) {
  const t = useTranslations("theme");
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Avoid icon mismatch between server (always renders for "system" → light)
  // and client (resolves preference). We render a placeholder icon on the
  // server, then swap to the resolved one after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: t("light"), Icon: Sun },
    { value: "dark", label: t("dark"), Icon: Moon },
    { value: "system", label: t("system"), Icon: Monitor },
  ];

  /** Pick the icon that represents the *current* state visually. */
  const ActiveIcon = mounted
    ? resolvedTheme === "dark"
      ? Moon
      : Sun
    : Sun;

  if (variant === "menu") {
    // Inline 3-button row — used in the mobile drawer.
    return (
      <div
        className={`flex items-center gap-1 p-1 rounded-lg bg-muted ${className ?? ""}`}
        role="radiogroup"
        aria-label={t("label")}
      >
        {options.map(({ value, label, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: dropdown trigger button.
  return (
    <div className={`relative ${className ?? ""}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-primary hover:bg-muted transition-colors"
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50"
        >
          {options.map(({ value, label, Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:bg-muted hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
