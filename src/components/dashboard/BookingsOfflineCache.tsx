"use client";

import { useEffect, useState } from "react";
import { CloudOff, Database } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getOfflineCache,
  setOfflineCache,
} from "@/lib/offline-cache";

export type CachedBookingItem = {
  id: string;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentType: string;
  courtName: string;
  locationName: string;
};

type Props = {
  userId: string;
  /** Bookings rendered server-side. When present we refresh the cache. */
  serverItems: CachedBookingItem[] | null;
};

/**
 * Tiny client-side island that bridges the SSR-rendered bookings list
 * with offline storage:
 *
 *   - On every successful server render we receive the latest items
 *     and push them into localStorage. Cheap and synchronous.
 *   - When the user is offline AND the server failed to render anything
 *     (serverItems is null) we surface a banner indicating the cached
 *     data shown above is from the last online session.
 *
 * The actual cached-list rendering happens via server data; we only
 * persist the snapshot here. This keeps the SSR path canonical and the
 * offline path additive.
 */
export default function BookingsOfflineCache({ userId, serverItems }: Props) {
  const t = useTranslations("pwa");
  const [showCachedBanner, setShowCachedBanner] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Refresh the cache whenever the server gave us items.
  useEffect(() => {
    if (serverItems && serverItems.length > 0) {
      setOfflineCache("bookings", serverItems, userId);
    }
  }, [serverItems, userId]);

  // If the SSR couldn't reach the DB (serverItems === null) and we're
  // offline, surface the cached-snapshot banner.
  useEffect(() => {
    if (serverItems !== null) {
      setShowCachedBanner(false);
      return;
    }
    const cached = getOfflineCache<CachedBookingItem[]>("bookings", userId);
    if (cached && !online) {
      setShowCachedBanner(true);
      setCachedAt(cached.cachedAt);
    }
  }, [serverItems, userId, online]);

  if (!showCachedBanner && online) return null;

  return (
    <div className="mb-3 px-3 py-2 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs flex items-center gap-2">
      {online ? (
        <Database className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <CloudOff className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>
        {t("offline_cached_notice")}
        {cachedAt
          ? ` (${new Date(cachedAt).toLocaleString()})`
          : ""}
      </span>
    </div>
  );
}
