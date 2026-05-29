"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Catches `beforeinstallprompt` (Chrome/Edge/Android) and shows a small
 * sticky banner inviting the user to install JayField as an app.
 *
 * Behavior:
 *   - Hidden if the app is already running standalone (display-mode).
 *   - Hidden after install (`appinstalled` fires).
 *   - Dismissible — remembers the dismissal in localStorage for 7 days.
 *
 * Note: iOS Safari doesn't fire beforeinstallprompt. We could surface a
 * separate "Add to Home Screen" hint there, but that's noisy enough that
 * we leave it out of this first cut.
 */
const DISMISS_KEY = "jayfield:pwa-install-dismissed-until";
const DISMISS_DAYS = 7;

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function InstallPwaPrompt() {
  const t = useTranslations("pwa");
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed?
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS legacy
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) return;

    // Honor the dismissal window.
    try {
      const until = window.localStorage.getItem(DISMISS_KEY);
      if (until && Number(until) > Date.now()) return;
    } catch {
      // localStorage blocked — continue anyway.
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setEvt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onInstall = async () => {
    if (!evt) return;
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      if (choice.outcome === "dismissed") {
        snoozeDismiss();
      }
    } catch (e) {
      console.error("[pwa] install prompt failed", e);
    } finally {
      setVisible(false);
      setEvt(null);
    }
  };

  const onDismiss = () => {
    snoozeDismiss();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t("install_title")}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 bg-surface border border-border rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {t("install_title")}
        </p>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
          {t("install_subtitle")}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={onInstall}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-light transition-colors"
          >
            {t("install_cta")}
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {t("install_dismiss")}
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        aria-label={t("install_dismiss")}
        className="text-text-secondary hover:text-text-primary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function snoozeDismiss() {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(DISMISS_KEY, String(until));
  } catch {
    // ignore
  }
}
