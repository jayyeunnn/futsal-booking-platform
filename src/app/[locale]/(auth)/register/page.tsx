import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { isGoogleOAuthEnabled } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/register",
    titleId: "Daftar Akun JayField — Gratis",
    titleEn: "Sign up for JayField — Free",
    descriptionId:
      "Daftar gratis di JayField dan jadi member langsung. Dapatkan diskon, poin, dan benefit eksklusif.",
    descriptionEn:
      "Create a free JayField account and become a member instantly. Unlock discounts, points, and exclusive perks.",
  });
}

export default function RegisterPage() {
  return <RegisterForm googleEnabled={isGoogleOAuthEnabled} />;
}
