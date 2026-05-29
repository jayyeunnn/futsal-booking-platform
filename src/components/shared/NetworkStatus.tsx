"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Tiny pill that appears at the top of the viewport when the browser
 * reports `navigator.onLine === false`. Disappears as soon as we go back
 * online. Pure visual signal — no network calls of its own.
 *
 * Mounted globally via the locale layout so every authenticated page
 * gets the indicator without per-page wiring.
 */
export default function NetworkStatus() {
  const t = useTranslations("pwa");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-warning text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-2"
    >
      <WifiOff className="w-3.5 h-3.5" />
      {t("offline_indicator")}
    </div>
  );
}
