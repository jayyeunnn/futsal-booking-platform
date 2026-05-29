import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
  userName: string;
  newTier: "SILVER" | "GOLD";
  appUrl: string;
};

const TIER_BENEFITS: Record<Props["newTier"], string[]> = {
  SILVER: [
    "Diskon 10% di setiap booking",
    "Priority booking H+1 di jam prime-time",
    "Akses promo member eksklusif",
  ],
  GOLD: [
    "Diskon 20% di setiap booking",
    "Priority booking H+2 di jam prime-time",
    "Free extra time 15 menit per sesi",
    "Undangan event eksklusif",
  ],
};

/**
 * Sent automatically when user reaches Silver/Gold tier.
 */
export function TierUpgradeEmail({ userName, newTier, appUrl }: Props) {
  const benefits = TIER_BENEFITS[newTier];
  return (
    <BaseLayout preview={`Selamat! Kamu naik ke ${newTier}`}>
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        🎉 Selamat, {userName}!
      </Heading>
      <Text>
        Kamu resmi naik ke tier <strong>{newTier}</strong>. Terima kasih sudah
        jadi member setia JayField.
      </Text>
      <Text>
        <strong>Benefit tier {newTier}:</strong>
        {benefits.map((b, i) => (
          <span key={i} style={{ display: "block", marginTop: 6 }}>
            ✓ {b}
          </span>
        ))}
      </Text>
      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/dashboard/membership`} variant="cta">
          Lihat Member Area
        </Button>
      </Text>
    </BaseLayout>
  );
}

export default TierUpgradeEmail;
