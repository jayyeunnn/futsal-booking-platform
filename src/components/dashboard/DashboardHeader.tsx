"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Globe,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import ThemeToggle from "@/components/shared/ThemeToggle";

type Props = {
  userName: string;
  userEmail: string;
  userTier: string;
  avatarUrl: string | null;
  role: "USER" | "STAFF" | "ADMIN";
};

/**
 * Top bar inside the user dashboard. Shows:
 *  - notification bell with live unread badge
 *  - locale switcher
 *  - avatar + dropdown (profile, admin panel for staff/admin, logout)
 */
export default function DashboardHeader({
  userName,
  userEmail,
  userTier,
  avatarUrl,
  role,
}: Props) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";
  const switchLocale = locale === "id" ? "en" : "id";
  const isStaffOrAdmin = role === "ADMIN" || role === "STAFF";

  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Poll unread count every 60s. Cheap query, fine for an MVP.
  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const r = await fetch("/api/notifications/unread-count");
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled && json?.success) {
          setUnread(json.data.count ?? 0);
        }
      } catch {
        // silent — header badge is non-critical
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const tierColors: Record<string, string> = {
    BRONZE: "bg-amber-700/10 text-amber-700",
    SILVER: "bg-slate-300/40 text-slate-700",
    GOLD: "bg-yellow-100 text-yellow-700",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-error/10 text-error",
    STAFF: "bg-info/10 text-info",
    USER: "",
  };

  return (
    <header className="sticky top-0 z-20 bg-surface border-b border-border px-4 sm:px-6 py-3 flex items-center justify-end gap-3 lg:gap-4">
      {/* Locale switch */}
      <Link
        href={pathname.replace(`/${locale}`, `/${switchLocale}`)}
        className="hidden sm:flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
      >
        <Globe className="h-4 w-4" />
        {locale.toUpperCase()}
      </Link>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Notification bell */}
      <Link
        href={`/${locale}/dashboard/notifications`}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-cta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-medium text-text-primary line-clamp-1 max-w-[120px]">
              {userName}
            </span>
            <div className="flex items-center gap-1">
              {isStaffOrAdmin && (
                <span
                  className={`text-[10px] font-bold px-1.5 rounded ${roleColors[role]}`}
                >
                  {role}
                </span>
              )}
              <span
                className={`text-[10px] font-bold px-1.5 rounded ${tierColors[userTier] ?? ""}`}
              >
                {userTier}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-text-secondary" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-text-primary line-clamp-1">
                {userName}
              </p>
              <p className="text-xs text-text-secondary line-clamp-1">
                {userEmail}
              </p>
              {isStaffOrAdmin && (
                <span
                  className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${roleColors[role]}`}
                >
                  {role}
                </span>
              )}
            </div>
            <div className="py-1">
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-muted hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4" />
                Profil
              </Link>
              {isStaffOrAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-cta hover:bg-cta/5 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <Link
                href={pathname.replace(`/${locale}`, `/${switchLocale}`)}
                className="flex sm:hidden items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-muted hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                <Globe className="h-4 w-4" />
                {switchLocale === "en" ? "English" : "Indonesia"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
