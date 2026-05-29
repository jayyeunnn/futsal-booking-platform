import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
  userName: string;
  appUrl: string;
};

/**
 * Sent right after a user registers a new account.
 * They are auto-enrolled as Bronze member.
 */
export function WelcomeEmail({ userName, appUrl }: Props) {
  return (
    <BaseLayout preview="Selamat datang di JayField!">
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        Halo {userName}, selamat datang di JayField!
      </Heading>
      <Text>
        Akun kamu sudah aktif dan kamu otomatis menjadi member Bronze. Mulai
        kumpulkan poin di setiap booking dan naik tier untuk benefit eksklusif.
      </Text>
      <Text>
        <strong>Benefit member:</strong>
        <br />• Bronze: Akses promo member, kumpul poin
        <br />• Silver: Diskon 10% + priority booking
        <br />• Gold: Diskon 20% + extra time + invitation event eksklusif
      </Text>
      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/booking`} variant="cta">
          Booking Lapangan Sekarang
        </Button>
      </Text>
    </BaseLayout>
  );
}

export default WelcomeEmail;
