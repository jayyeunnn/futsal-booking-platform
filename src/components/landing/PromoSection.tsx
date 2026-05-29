import Link from "next/link";
import { Tag, Sparkles, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Server component — list real active promos from DB.
 * Falls back to evergreen "Daftar Member" CTA when no promo exists.
 */
export default async function PromoSection({
  locale = "id",
}: {
  locale?: string;
}) {
  const t = await getTranslations("landing");
  const now = new Date();

  const promos = await prisma.promo.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: "desc" },
    take: 3,
  });

  const active = promos.filter(
    (p) => p.usageLimit === null || p.usageCount < p.usageLimit
  );

  return (
    <section id="promo" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            {t("promo_title")}
          </h2>
        </div>

        {active.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center bg-surface border border-border rounded-xl p-10">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-cta opacity-70" />
            <p className="text-text-primary font-medium mb-1">
              Belum ada promo aktif saat ini
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Daftar member gratis untuk dapat diskon otomatis tiap booking.
            </p>
            <Link
              href={`/${locale}/register`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light"
            >
              {t("cta_register")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((promo) => {
              const valueLabel =
                promo.discountType === "PERCENTAGE"
                  ? `${Number(promo.discountValue)}%`
                  : formatRupiah(Number(promo.discountValue));
              const tierLabel = promo.minTier
                ? `${promo.minTier}+ only`
                : promo.memberOnly
                  ? "Member only"
                  : null;
              return (
                <div
                  key={promo.id}
                  className="bg-surface rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-border"
                >
                  <div className="bg-gradient-to-br from-cta to-cta-hover p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                        {promo.code}
                      </span>
                    </div>
                    <p className="text-3xl font-heading font-bold mb-1">
                      Diskon {valueLabel}
                    </p>
                    <p className="text-sm opacity-90 line-clamp-1">
                      {promo.title}
                    </p>
                  </div>
                  <div className="p-5">
                    {promo.description && (
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {promo.description}
                      </p>
                    )}
                    <div className="space-y-1 text-xs text-text-secondary mb-4">
                      <p>
                        Berlaku s/d{" "}
                        {promo.endDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {promo.minBooking && (
                        <p>
                          Min booking{" "}
                          {formatRupiah(Number(promo.minBooking))}
                        </p>
                      )}
                      {tierLabel && (
                        <p className="text-warning font-medium">{tierLabel}</p>
                      )}
                    </div>
                    <Link
                      href={`/${locale}/booking`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light"
                    >
                      Pakai Sekarang <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
