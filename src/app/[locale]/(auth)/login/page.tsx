import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { isGoogleOAuthEnabled } from "@/lib/auth";
import LoginForm from "./LoginForm";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/login",
    titleId: "Masuk Akun JayField",
    titleEn: "Sign in to JayField",
    descriptionId:
      "Masuk ke akun JayField untuk booking lapangan futsal, kelola booking, dan klaim benefit member.",
    descriptionEn:
      "Sign in to your JayField account to book futsal courts, manage bookings, and claim member perks.",
    noIndex: true,
  });
}

export default function LoginPage() {
  return <LoginForm googleEnabled={isGoogleOAuthEnabled} />;
}
