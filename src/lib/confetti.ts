import confetti from "canvas-confetti";

/**
 * Brand-themed confetti effects for milestone moments.
 * Honors prefers-reduced-motion — no confetti for users who opted out.
 */
const respectReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const BRAND_COLORS = ["#1B5E20", "#FF6D00", "#4CAF50", "#FF9800"];

/**
 * Standard celebratory burst — used for booking confirmed,
 * review submit, etc.
 */
export function celebrateSmall() {
  if (respectReducedMotion()) return;
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
  });
}

/**
 * Bigger celebration for major milestones (tier upgrade, redeem reward,
 * first booking, etc).
 */
export function celebrateBig() {
  if (respectReducedMotion()) return;

  // Two cannons firing from left and right for stage-curtain effect.
  const fire = (angle: number, originX: number) => {
    confetti({
      particleCount: 80,
      spread: 60,
      angle,
      origin: { x: originX, y: 0.85 },
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
      gravity: 0.9,
      ticks: 200,
    });
  };

  fire(60, 0.1); // left cannon shoots toward upper-right
  fire(120, 0.9); // right cannon shoots toward upper-left

  // Star burst from center 200ms later for layered feel.
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: BRAND_COLORS,
      shapes: ["star"],
      disableForReducedMotion: true,
    });
  }, 200);
}
