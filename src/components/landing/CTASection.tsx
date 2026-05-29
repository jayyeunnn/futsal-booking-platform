"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CTASection() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-white rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
          {t("cta_title")}
        </h2>
        <p className="mt-4 text-lg text-white/80">
          {t("cta_subtitle")}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/booking`}
            className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-xl"
          >
            {tCommon("book_now")}
            <ChevronRight className="h-5 w-5" />
          </Link>
          <Link
            href={`/${locale}/register`}
            className="inline-flex items-center gap-2 border-2 border-white/50 hover:border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:bg-white/10"
          >
            {t("cta_register")}
          </Link>
        </div>
      </div>
    </section>
  );
}
