"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Bell,
  Calendar,
  CreditCard,
  Tag,
  Trophy,
  Settings,
  Check,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { NotificationType } from "@/types";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
};

type Props = {
  locale: string;
  initialItems: Notification[];
  initialUnread: number;
  initialTotal: number;
};

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  BOOKING: Calendar,
  PAYMENT: CreditCard,
  PROMO: Tag,
  MEMBERSHIP: Trophy,
  SYSTEM: Settings,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  BOOKING: "text-primary bg-primary/10",
  PAYMENT: "text-cta bg-cta/10",
  PROMO: "text-info bg-info/10",
  MEMBERSHIP: "text-warning bg-warning/10",
  SYSTEM: "text-text-secondary bg-muted",
};

const TYPE_LABEL: Record<NotificationType | "ALL", string> = {
  ALL: "Semua",
  BOOKING: "Booking",
  PAYMENT: "Pembayaran",
  PROMO: "Promo",
  MEMBERSHIP: "Membership",
  SYSTEM: "Sistem",
};

/**
 * Notification list with mark-as-read controls.
 * Uses initial server-rendered items, then mutates locally on read actions.
 */
export function NotificationCenter({
  locale,
  initialItems,
  initialUnread,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = (searchParams.get("type") ?? "ALL") as
    | NotificationType
    | "ALL";

  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const [pending, startTransition] = useTransition();
  const [readAllLoading, setReadAllLoading] = useState(false);

  useEffect(() => {
    setItems(initialItems);
    setUnread(initialUnread);
  }, [initialItems, initialUnread]);

  const dateLocale = locale === "id" ? idLocale : enUS;

  const onMarkRead = async (id: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    } catch {
      // best-effort; UI already updated
    }
  };

  const onMarkAllRead = async () => {
    if (unread === 0) return;
    setReadAllLoading(true);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
    } catch {
      // best-effort
    } finally {
      setReadAllLoading(false);
    }
  };

  const setFilter = (next: NotificationType | "ALL") => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (next === "ALL") params.delete("type");
      else params.set("type", next);
      router.push(`/${locale}/dashboard/notifications?${params.toString()}`);
    });
  };

  const filters: Array<NotificationType | "ALL"> = [
    "ALL",
    "BOOKING",
    "PAYMENT",
    "PROMO",
    "MEMBERSHIP",
    "SYSTEM",
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {filters.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={pending}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary"
              }`}
            >
              {TYPE_LABEL[f]}
            </button>
          );
        })}
        <div className="flex-1" />
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            disabled={readAllLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:border-primary text-text-primary transition-colors disabled:opacity-50"
          >
            {readAllLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Tandai semua dibaca ({unread})
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl">
        {items.length === 0 ? (
          <EmptyState variant="no-notifications" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const Icon = TYPE_ICON[n.type];
              const isUnread = !n.isRead;
              const inner = (
                <div
                  className={`flex items-start gap-3 p-4 ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLOR[n.type]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-text-primary line-clamp-1">
                        {n.title}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-cta mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-1">
                      {format(new Date(n.createdAt), "dd MMM yyyy · HH:mm", {
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                  {isUnread && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkRead(n.id);
                      }}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              );

              return (
                <li key={n.id}>
                  {n.actionUrl ? (
                    <Link
                      href={
                        n.actionUrl.startsWith("/")
                          ? `/${locale}${n.actionUrl}`
                          : n.actionUrl
                      }
                      onClick={() => isUnread && onMarkRead(n.id)}
                      className="block hover:bg-muted/30 transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
