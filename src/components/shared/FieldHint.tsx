import { Info } from "lucide-react";

type Props = {
  /** Hint text — should be helpful, not just repeat label. */
  children: React.ReactNode;
  /** Show info icon prefix (default true). */
  withIcon?: boolean;
  /** Variant: muted (default) / warning / info */
  tone?: "muted" | "warning" | "info";
  className?: string;
};

const TONE_CLASSES: Record<NonNullable<Props["tone"]>, string> = {
  muted: "text-text-secondary",
  warning: "text-warning",
  info: "text-info",
};

/**
 * Inline helper text di bawah input field. Pakai untuk kasih konteks
 * tambahan ke user — contoh:
 *   - Kenapa kami minta data ini ("untuk reminder H-1")
 *   - Format yang diharapkan ("contoh: 0812xxxxxxxx")
 *   - Privacy note ("nomor ini tidak akan ditampilkan publik")
 *
 * Hindari hint yang cuma mengulang label. Tujuan: jawab pertanyaan
 * "kenapa harus diisi?" yang user sering ragu-ragu.
 */
export function FieldHint({
  children,
  withIcon = true,
  tone = "muted",
  className = "",
}: Props) {
  return (
    <p
      className={`mt-1 flex items-start gap-1 text-xs ${TONE_CLASSES[tone]} ${className}`}
    >
      {withIcon && <Info className="h-3 w-3 mt-0.5 shrink-0 opacity-80" />}
      <span>{children}</span>
    </p>
  );
}
