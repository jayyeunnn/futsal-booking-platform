"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "id";
  const switchLocale = currentLocale === "id" ? "en" : "id";
  const newPath = pathname.replace(`/${currentLocale}`, `/${switchLocale}`);

  return (
    <Link
      href={newPath}
      className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
      aria-label={`Switch to ${switchLocale === "en" ? "English" : "Bahasa Indonesia"}`}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{currentLocale.toUpperCase()}</span>
    </Link>
  );
}
