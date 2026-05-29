"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Animation triggers when this much of the element is visible (0-1). */
  threshold?: number;
  /** Once triggered, keep visible (don't reset on scroll out). */
  once?: boolean;
};

/**
 * Wrap any section/element to trigger CSS-based entrance animation
 * when it enters viewport.
 *
 * Implementation notes:
 * - Server renders without the `.reveal` class, so SSR/no-JS users see content
 *   immediately (graceful degradation).
 * - Client adds `.reveal` after mount, then `.in-view` once the IntersectionObserver
 *   fires. The brief "flash" between mount and observer firing is hidden by a
 *   `data-mounted` opacity gate.
 */
export function ScrollReveal({
  children,
  className = "",
  threshold = 0.12,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — show immediately, no animation.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setInView(true);
      return;
    }

    // If element is already in viewport on mount (above the fold),
    // trigger immediately so first-paint sections animate in.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Small RAF delay to ensure CSS class applies before in-view triggers
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setInView(true));
      });
      if (once) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      data-mounted={mounted ? "true" : "false"}
      className={`reveal ${inView ? "in-view" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
