"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  /** Format suffix appended to the number (e.g. "+", "k+"). */
  suffix?: string;
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Use this string as-is when value is non-numeric (e.g. "—"). */
  placeholder?: string;
  className?: string;
};

/**
 * Animated counter that ticks from 0 to `value` once it enters viewport.
 * Falls back to displaying the placeholder/value as-is when:
 *   - SSR (initial paint)
 *   - User prefers reduced motion
 *
 * Used in SocialProofBar to make the stats feel alive when scrolled past.
 */
export function CountUp({
  value,
  suffix = "",
  duration = 1500,
  placeholder,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
          // Use requestAnimationFrame for smooth easing.
          const startTime = performance.now();
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const next = Math.round(easeOut(t) * value);
            setDisplay(next);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, started]);

  if (placeholder !== undefined) {
    return (
      <span ref={ref} className={className}>
        {placeholder}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
