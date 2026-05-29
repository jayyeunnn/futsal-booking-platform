"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Coins,
  Bell,
  User,
  Heart,
  Repeat,
  Menu,
  X,
  Shield,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "", icon: LayoutDashboard, labelKey: "overview" },
  { href: "/bookings", icon: Calendar, labelKey: "my_bookings" },
  { href: "/recurring", icon: Repeat, labelKey: "recurring" },
  { href: "/membership", icon: Trophy, labelKey: "membership" },
  { href: "/points", icon: Coins, labelKey: "points" },
  { href: "/favorites", icon: Heart, labelKey: "favorites" },
  { href: "/referral", icon: UserPlus, labelKey: "referral" },
  { href: "/notifications", icon: Bell, labelKey: "notifications" },
  { href: "/profile", icon: User, labelKey: "profile" },
] as const;

type Props = {
  role: "USER" | "STAFF" | "ADMIN";
};

/**
 * Sidebar for the user dashboard. Mirrors the styling of AdminSidebar
 * but anchors to /[locale]/dashboard/* instead.
 *
 * For ADMIN/STAFF users, shows an extra "Admin Panel" entry at the bottom
 * for quick switching between member and admin contexts.
 */
export default function DashboardSidebar({ role }: Props) {
  const t = useTranslations("dashboardNav");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardRoot = `/${locale}/dashboard`;
  const isStaffOrAdmin = role === "ADMIN" || role === "STAFF";

  const isActive = (href: string) => {
    const full = href === "" ? dashboardRoot : `${dashboardRoot}${href}`;
    if (href === "") {
      return pathname === full || pathname === `${full}/`;
    }
    return pathname.startsWith(full);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold text-white">
            Jay<span className="text-cta">Field</span>
          </span>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
            Member
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const href =
            item.href === "" ? dashboardRoot : `${dashboardRoot}${item.href}`;
          return (
            <Link
              key={item.labelKey}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {t(item.labelKey)}
            </Link>
          );
        })}

        {/* Admin/Staff shortcut */}
        {isStaffOrAdmin && (
          <>
            <div className="pt-3 mt-3 border-t border-gray-700" />
            <Link
              href={`/${locale}/admin`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cta hover:bg-gray-700 transition-colors"
            >
              <Shield className="h-4.5 w-4.5 shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <Link
          href={`/${locale}/booking`}
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-cta hover:bg-cta-hover text-white transition-colors"
        >
          <Calendar className="h-4 w-4" />
          {t("book_now")}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-secondary z-30">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-secondary">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
