"use client";

import type { ReactNode } from "react";

type Props = {
  /** Konten utama (left side) — biasanya total/summary singkat. */
  primary: ReactNode;
  /** Konten secondary (di bawah primary) — opsional. */
  secondary?: ReactNode;
  /** Action button(s). */
  action: ReactNode;
};

/**
 * Sticky bottom bar untuk mobile yang nge-pin total + tombol CTA ke
 * bottom screen. Cocok buat checkout flow atau detail page yang panjang
 * supaya tombol "Lanjut" / "Bayar" selalu thumb-reachable.
 *
 * Hidden di desktop (md+) — desktop punya sidebar sticky sendiri.
 *
 * Pakai `safe-area-inset-bottom` supaya nggak nutup home indicator iPhone.
 */
export function StickyMobileCta({ primary, secondary, action }: Props) {
  return (
    <>
      {/* Spacer biar konten di atas nggak ketutup sticky bar saat scroll
          ke bottom. Tinggi disamakan dengan bar (kira-kira). */}
      <div aria-hidden className="md:hidden h-24" />

      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">
              {primary}
            </div>
            {secondary && (
              <div className="text-xs text-text-secondary truncate">
                {secondary}
              </div>
            )}
          </div>
          <div className="shrink-0">{action}</div>
        </div>
      </div>
    </>
  );
}
