"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, CreditCard, MapPin,
  Trophy, Tag, BarChart3, RefreshCcw, Users, Settings, Menu, X, Star, Gift
} from "lucide-react";
import { useState } from "react";

const getNavItems = (locale: string) => [
  { href: `/${locale}/admin`, icon: LayoutDashboard, labelKey: "overview" },
  { href: `/${locale}/admin/bookings`, icon: Calendar, labelKey: "bookings" },
  { href: `/${locale}/admin/payments`, icon: CreditCard, labelKey: "payments" },
  { href: `/${locale}/admin/courts`, icon: MapPin, labelKey: "courts" },
  { href: `/${locale}/admin/locations`, icon: MapPin, labelKey: "locations" },
  { href: `/${locale}/admin/members`, icon: Trophy, labelKey: "members" },
  { href: `/${locale}/admin/promos`, icon: Tag, labelKey: "promos" },
  { href: `/${locale}/admin/rewards`, icon: Gift, labelKey: "rewards" },
  { href: `/${locale}/admin/reviews`, icon: Star, labelKey: "reviews" },
  { href: `/${locale}/admin/reports`, icon: BarChart3, labelKey: "reports" },
  { href: `/${locale}/admin/refunds`, icon: RefreshCcw, labelKey: "refunds" },
  { href: `/${locale}/admin/users`, icon: Users, labelKey: "users" },
  { href: `/${locale}/admin/settings`, icon: Settings, labelKey: "settings" },
];

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavItems(locale);

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) return pathname === href || pathname === `/${locale}/admin/`;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold text-white">
            Jay<span className="text-cta">Field</span>
          </span>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {t(item.labelKey as never)}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-secondary">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-secondary">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
