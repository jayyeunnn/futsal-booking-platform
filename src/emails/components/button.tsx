import { Button as REButton } from "@react-email/components";
import * as React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "cta";
};

/**
 * Branded CTA button for transactional emails.
 * `primary` = green, `cta` = orange.
 */
export function Button({ href, children, variant = "cta" }: Props) {
  const bg = variant === "primary" ? "#1B5E20" : "#FF6D00";
  return (
    <REButton
      href={href}
      style={{
        backgroundColor: bg,
        borderRadius: "8px",
        color: "#FFFFFF",
        display: "inline-block",
        fontSize: "16px",
        fontWeight: 600,
        padding: "12px 24px",
        textDecoration: "none",
      }}
    >
      {children}
    </REButton>
  );
}
