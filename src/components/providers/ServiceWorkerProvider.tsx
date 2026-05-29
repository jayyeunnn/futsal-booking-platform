"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Registers `/sw.js` once on mount, only in production builds.
 * In dev we skip registration to avoid stale-cache headaches while iterating.
 *
 * When a new SW version is detected (`installing` -> `installed` while a
 * controller already exists), we surface a toast with an "Update sekarang"
 * action that messages SKIP_WAITING + reloads the page.
 *
 * Safe to render multiple times — the browser dedupes by scope.
 */
export default function ServiceWorkerProvider({
  locale = "id",
}: {
  locale?: string;
}) {
  const refreshing = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isEn = locale === "en";
    const updateLabel = isEn ? "Update available" : "Update tersedia";
    const updateBody = isEn
      ? "A new version of JayField is ready."
      : "Versi baru JayField sudah siap.";
    const updateAction = isEn ? "Update now" : "Update sekarang";

    let swReg: ServiceWorkerRegistration | null = null;

    const onUpdateFound = (reg: ServiceWorkerRegistration) => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (
          installing.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // A new SW is waiting — invite the user to refresh.
          toast(updateLabel, {
            description: updateBody,
            duration: 10_000,
            action: {
              label: updateAction,
              onClick: () => {
                installing.postMessage({ type: "SKIP_WAITING" });
              },
            },
          });
        }
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        swReg = reg;
        if (reg.waiting && navigator.serviceWorker.controller) {
          // SW already waiting on first load — show update toast immediately.
          toast(updateLabel, {
            description: updateBody,
            duration: 10_000,
            action: {
              label: updateAction,
              onClick: () => {
                reg.waiting?.postMessage({ type: "SKIP_WAITING" });
              },
            },
          });
        }
        reg.addEventListener("updatefound", () => onUpdateFound(reg));
      })
      .catch((err) => {
        console.error("[sw] registration failed", err);
      });

    // When the new SW takes over, reload once so the user gets the latest UI.
    const onControllerChange = () => {
      if (refreshing.current) return;
      refreshing.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
      // Don't unregister the SW on unmount — we want it to keep serving.
      void swReg;
    };
  }, [locale]);

  return null;
}
