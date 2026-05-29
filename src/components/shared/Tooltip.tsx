"use client";

import { useState } from "react";

type Props = {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
};

const SIDE_CLASSES: Record<NonNullable<Props["side"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ARROW_CLASSES: Record<NonNullable<Props["side"]>, string> = {
  top: "top-full left-1/2 -translate-x-1/2 -translate-y-px border-l-transparent border-r-transparent border-b-transparent border-t-text-primary",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 translate-y-px border-l-transparent border-r-transparent border-t-transparent border-b-text-primary",
  left: "left-full top-1/2 -translate-y-1/2 -translate-x-px border-t-transparent border-b-transparent border-r-transparent border-l-text-primary",
  right:
    "right-full top-1/2 -translate-y-1/2 translate-x-px border-t-transparent border-b-transparent border-l-transparent border-r-text-primary",
};

/**
 * Lightweight tooltip — appears on hover/focus, hides on leave/blur.
 * Useful for icon-only buttons (pause, resume, delete, edit) where label
 * text is hidden visually but accessibility/UX needs it.
 *
 * Accessible: uses native `aria-label` via children, plus visual tooltip.
 * Keyboard: shows on focus too, not just hover.
 */
export function Tooltip({ content, children, side = "top" }: Props) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={`absolute z-50 px-2 py-1 rounded-md bg-text-primary text-white text-xs font-medium whitespace-nowrap pointer-events-none shadow-lg ${SIDE_CLASSES[side]}`}
        >
          {content}
          <span
            className={`absolute w-0 h-0 border-4 ${ARROW_CLASSES[side]}`}
          />
        </span>
      )}
    </span>
  );
}
