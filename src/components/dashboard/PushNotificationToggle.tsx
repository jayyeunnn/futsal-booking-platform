"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { showToast } from "@/lib/toast";

/**
 * UI for enabling/disabling Web Push for the current browser.
 *
 * Flow:
 *   1. Fetch VAPID public key from /api/notifications/subscribe (GET).
 *   2. Ask the browser for Notification permission.
 *   3. Subscribe via PushManager and POST the subscription to the server.
 *
 * Disable flow unsubscribes the PushManager registration and DELETEs the
 * row server-side. We don't try to revoke the OS-level Notification
 * permission — browsers don't expose that anyway.
 *
 * Renders a self-contained card; drop into any settings page.
 */
type Status = "loading" | "unsupported" | "denied" | "off" | "on";

export default function PushNotificationToggle() {
  const t = useTranslations("pwa");
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!supported) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "on" : "off");
      } catch {
        if (!cancelled) setStatus("off");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      // 1. Get VAPID public key
      const keyRes = await fetch("/api/notifications/subscribe", {
        method: "GET",
      });
      if (!keyRes.ok) throw new Error("vapid-fetch-failed");
      const keyJson = (await keyRes.json()) as {
        success: boolean;
        data?: { publicKey: string | null };
      };
      const publicKey = keyJson.data?.publicKey;
      if (!publicKey) {
        showToast.error(t("push_not_configured"));
        return;
      }

      // 2. Request permission
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        if (perm === "denied") setStatus("denied");
        showToast.error(t("push_permission_denied"));
        return;
      }

      // 3. Subscribe via SW registration
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast: TS's BufferSource here insists on ArrayBuffer-backed
          // views, but Push API accepts any Uint8Array.
          applicationServerKey:
            urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
        }));

      // 4. Persist server-side
      const json = sub.toJSON();
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: {
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
          },
          userAgent:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 500)
              : undefined,
        }),
      });
      if (!res.ok) throw new Error("subscribe-failed");

      setStatus("on");
      showToast.success(t("push_enabled"));
    } catch (e) {
      console.error("[push] enable failed", e);
      showToast.error(t("push_enable_failed"));
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe().catch(() => {});
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {});
      }
      setStatus("off");
      showToast.success(t("push_disabled"));
    } catch (e) {
      console.error("[push] disable failed", e);
      showToast.error(t("push_disable_failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            status === "on"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-text-secondary"
          }`}
        >
          {status === "on" ? (
            <Bell className="w-5 h-5" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {t("push_title")}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {t("push_subtitle")}
          </p>

          <div className="mt-3">
            {status === "loading" && (
              <p className="text-xs text-text-secondary inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> {t("push_checking")}
              </p>
            )}
            {status === "unsupported" && (
              <p className="text-xs text-text-secondary">
                {t("push_unsupported")}
              </p>
            )}
            {status === "denied" && (
              <p className="text-xs text-error">{t("push_blocked")}</p>
            )}
            {status === "off" && (
              <button
                onClick={enable}
                disabled={busy}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-light disabled:opacity-50 inline-flex items-center gap-1"
              >
                {busy ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Bell className="w-3 h-3" />
                )}
                {t("push_enable")}
              </button>
            )}
            {status === "on" && (
              <button
                onClick={disable}
                disabled={busy}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-primary hover:border-primary disabled:opacity-50 inline-flex items-center gap-1"
              >
                {busy ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <BellOff className="w-3 h-3" />
                )}
                {t("push_disable")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * web-push expects the applicationServerKey as a Uint8Array, but the
 * server gives us a URL-safe base64 string. This helper does the
 * standard conversion (RFC 4648 §5).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  // Allocate an ArrayBuffer-backed Uint8Array explicitly so the type
  // matches BufferSource (Uint8Array<ArrayBuffer>) — newer TS DOM lib
  // distinguishes between ArrayBuffer and SharedArrayBuffer-backed views.
  const buf = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i += 1) buf[i] = rawData.charCodeAt(i);
  return buf;
}
