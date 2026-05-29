"use client";

import AdminSidebar from "./AdminSidebar";
import { Bell, User } from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-surface border-b border-border px-6 py-4 flex items-center justify-end gap-3">
          <ThemeToggle />
          <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              5
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-primary hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
