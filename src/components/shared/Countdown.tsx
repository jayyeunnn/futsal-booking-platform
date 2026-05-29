"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Target deadline (ISO string atau Date). */
  deadline: string | Date;
  /** Dipanggil saat countdown selesai. */
  onExpire?: () => void;
  /** Format: "compact" (00:00) atau "verbose" (5 menit 23 detik). Default compact. */
  format?: "compact" | "verbose";
  /** Warning threshold dalam detik — turn orange di bawah ini. Default 600 (10 menit). */
  warnAt?: number;
  /** Critical threshold dalam detik — turn red di bawah ini. Default 60 (1 menit). */
  criticalAt?: number;
};

/**
 * Live countdown timer ke deadline tertentu.
 * Auto-update tiap detik. Warna berubah dari muted → warning → error
 * saat mendekati deadline supaya user perhatian.
 */
export function Countdown({
  deadline,
  onExpire,
  format = "compact",
  warnAt = 600,
  criticalAt = 60,
}: Props) {
  const target =
    typeof deadline === "string"
      ? new Date(deadline).getTime()
      : deadline.getTime();

  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((target - Date.now()) / 1000)),
  );
  const [expiredFired, setExpiredFired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0 && !expiredFired) {
        setExpiredFired(true);
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onExpire, expiredFired]);

  const tone =
    remaining <= criticalAt
      ? "text-error"
      : remaining <= warnAt
        ? "text-warning"
        : "text-text-secondary";

  if (remaining === 0) {
    return <span className="text-error font-semibold">⏰ Waktu habis</span>;
  }

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (format === "verbose") {
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes} menit`);
    parts.push(`${seconds} detik`);
    return <span className={`font-mono font-semibold ${tone}`}>{parts.join(" ")}</span>;
  }

  // Compact: HH:MM:SS or MM:SS
  const pad = (n: number) => String(n).padStart(2, "0");
  const text = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  return <span className={`font-mono font-semibold ${tone} tabular-nums`}>{text}</span>;
}
