import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { locales, Locale } from "@/i18n";
import { buildMetadata, siteConfig } from "@/lib/seo";
import ServiceWorkerProvider from "@/components/providers/ServiceWorkerProvider";
import InstallPwaPrompt from "@/components/shared/InstallPwaPrompt";
import NetworkStatus from "@/components/shared/NetworkStatus";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const base = buildMetadata({
    locale: params.locale,
    path: "/",
    titleId: "JayField — Booking Lapangan Futsal",
    titleEn: "JayField — Book Your Futsal Court",
    descriptionId: siteConfig.description.id,
    descriptionEn: siteConfig.description.en,
  });

  // Use a title template so child pages can override the title and still
  // get the " | JayField" suffix automatically.
  return {
    ...base,
    title: {
      default: "JayField — Booking Lapangan Futsal",
      template: "%s | JayField",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "JayField",
    },
  };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="system"
        toastOptions={{
          style: { fontFamily: "var(--font-inter)" },
        }}
      />
      {/* PWA wiring — registers service worker, surfaces offline + install prompts */}
      <ServiceWorkerProvider locale={locale} />
      <NetworkStatus />
      <InstallPwaPrompt />
    </NextIntlClientProvider>
  );
}
