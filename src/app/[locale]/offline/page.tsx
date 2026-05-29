"use client";

import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Static offline fallback page. The service worker pre-caches both
 * `/id/offline` and `/en/offline` so this page is reachable when the
 * network is down.
 *
 * Keep this page lightweight — no data fetches, no network-dependent
 * subresources beyond what the SW already cached.
 */
export default function OfflinePage({
  params,
}: {
  params: { locale: string };
}) {
  const t = useTranslations("pwa");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <WifiOff className="w-8 h-8 text-text-secondary" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          {t("offline_title")}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t("offline_message")}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("offline_retry")}
          </button>
          <Link
            href={`/${params.locale}`}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:border-primary"
          >
            {t("offline_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
