"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function PricingSection() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";
  const [activeTab, setActiveTab] = useState<"weekday" | "weekend">("weekday");

  const pricing = {
    weekday: {
      regular: { indoor: "Rp 150.000", outdoor: "Rp 120.000", time: "08:00 - 16:00" },
      primeTime: { indoor: "Rp 250.000", outdoor: "Rp 200.000", time: "16:00 - 00:00" },
    },
    weekend: {
      regular: { indoor: "Rp 200.000", outdoor: "Rp 160.000", time: "08:00 - 16:00" },
      primeTime: { indoor: "Rp 300.000", outdoor: "Rp 250.000", time: "16:00 - 00:00" },
    },
  };

  const current = pricing[activeTab];

  return (
    <section className="py-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">{t("pricing_title")}</h2>
          <p className="mt-3 text-text-secondary text-lg">{t("pricing_subtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-surface rounded-lg p-1 shadow-sm border border-border">
            <button
              onClick={() => setActiveTab("weekday")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "weekday"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t("weekday")}
            </button>
            <button
              onClick={() => setActiveTab("weekend")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "weekend"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t("weekend")}
            </button>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-surface rounded-xl shadow-md overflow-hidden border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-primary/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Waktu</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">{t("indoor")}</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">{t("outdoor")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">{t("regular")}</div>
                  <div className="text-sm text-text-secondary">{current.regular.time}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-primary">{current.regular.indoor}</span>
                  <span className="text-sm text-text-secondary">{t("per_hour")}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-primary">{current.regular.outdoor}</span>
                  <span className="text-sm text-text-secondary">{t("per_hour")}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">{t("prime_time")}</div>
                  <div className="text-sm text-text-secondary">{current.primeTime.time}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-cta">{current.primeTime.indoor}</span>
                  <span className="text-sm text-text-secondary">{t("per_hour")}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-cta">{current.primeTime.outdoor}</span>
                  <span className="text-sm text-text-secondary">{t("per_hour")}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center mt-4 text-sm text-text-secondary">
          * Member dapat diskon hingga 20%
        </p>

        <div className="text-center mt-6">
          <Link
            href={`/${locale}/booking`}
            className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {tCommon("book_now")}
          </Link>
        </div>
      </div>
    </section>
  );
}
