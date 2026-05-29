import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ForgotPasswordForm from "./ForgotPasswordForm";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/forgot-password",
    titleId: "Lupa Password — JayField",
    titleEn: "Forgot Password — JayField",
    descriptionId:
      "Reset password akun JayField kamu. Masukkan email untuk menerima link reset.",
    descriptionEn:
      "Reset your JayField account password. Enter your email to receive a reset link.",
    noIndex: true,
  });
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
