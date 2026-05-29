import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
};

/**
 * Sent when user requests password reset via /forgot-password.
 */
export function PasswordResetEmail({
  userName,
  resetUrl,
  expiresInMinutes,
}: Props) {
  return (
    <BaseLayout preview="Reset password JayField">
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        Reset password kamu
      </Heading>
      <Text>Halo {userName},</Text>
      <Text>
        Kami menerima permintaan untuk reset password akun kamu. Klik tombol di
        bawah untuk membuat password baru. Link berlaku selama{" "}
        {expiresInMinutes} menit.
      </Text>
      <Text style={{ marginTop: "24px" }}>
        <Button href={resetUrl} variant="primary">
          Reset Password
        </Button>
      </Text>
      <Text style={{ color: "#616161", fontSize: "13px", marginTop: "24px" }}>
        Jika kamu tidak meminta reset password, abaikan email ini. Password
        kamu tidak akan berubah.
      </Text>
    </BaseLayout>
  );
}

export default PasswordResetEmail;
