import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Sparkles, ArrowRight, Copy } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { buildMetadata } from "@/lib/seo";

// ISR — promo refresh once per minute.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/promo",
    titleId: "Promo & Event Lapangan Futsal — JayField",
    titleEn: "Promo & Events — JayField",
    descriptionId:
      "Promo dan event terkini JayField. Dapatkan diskon dan benefit eksklusif untuk member.",
    descriptionEn:
      "Latest JayField promos and events. Unlock discounts and exclusive perks for members.",
  });
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function PromoPage({
  params,
}: {
  params: { locale: string };
}) {
  const now = new Date();
  const promos = await prisma.promo.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: "desc" },
  });
  const active = promos.filter(
    (p) => p.usageLimit === null || p.usageCount < p.usageLimit
  );
  const dateLocale = params.locale === "id" ? idLocale : enUS;

  return (
    <div className="bg-muted">
      <section className="bg-gradient-to-br from-cta to-cta-hover text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Promo & Event
          </h1>
          <p className="text-lg text-white/90">
            Hemat lebih banyak setiap kali main futsal
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {active.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-cta opacity-70" />
            <p className="text-text-primary font-medium mb-1">
              Belum ada promo aktif saat ini
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Daftar member gratis untuk dapat diskon otomatis tiap booking.
            </p>
            <Link
              href={`/${params.locale}/register`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light"
            >
              Daftar Member <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((promo) => {
              const valueLabel =
                promo.discountType === "PERCENTAGE"
                  ? `${Number(promo.discountValue)}%`
                  : formatRupiah(Number(promo.discountValue));
              return (
                <div
                  key={promo.id}
                  className="bg-surface rounded-xl overflow-hidden shadow-md border border-border flex flex-col"
                >
                  <div className="bg-gradient-to-br from-cta to-cta-hover p-6 text-white">
                    <Tag className="h-6 w-6 mb-3 opacity-90" />
                    <p className="text-3xl font-heading font-bold mb-1">
                      Diskon {valueLabel}
                    </p>
                    <p className="text-sm opacity-90 line-clamp-1">
                      {promo.title}
                    </p>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    {promo.description && (
                      <p className="text-sm text-text-secondary mb-4 flex-1">
                        {promo.description}
                      </p>
                    )}
                    <div className="space-y-1 text-xs text-text-secondary mb-4">
                      <p>
                        Berlaku{" "}
                        {format(promo.startDate, "dd MMM", {
                          locale: dateLocale,
                        })}{" "}
                        -{" "}
                        {format(promo.endDate, "dd MMM yyyy", {
                          locale: dateLocale,
                        })}
                      </p>
                      {promo.minBooking && (
                        <p>
                          Min booking{" "}
                          {formatRupiah(Number(promo.minBooking))}
                        </p>
                      )}
                      {promo.maxDiscount && promo.discountType === "PERCENTAGE" && (
                        <p>
                          Max diskon {formatRupiah(Number(promo.maxDiscount))}
                        </p>
                      )}
                      {promo.memberOnly && promo.minTier && (
                        <p className="text-warning font-medium">
                          Member {promo.minTier}+ only
                        </p>
                      )}
                      {promo.memberOnly && !promo.minTier && (
                        <p className="text-warning font-medium">Member only</p>
                      )}
                    </div>

                    <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-dashed border-border flex items-center justify-between gap-2">
                      <code className="text-sm font-mono font-bold text-primary">
                        {promo.code}
                      </code>
                      <span className="text-[11px] text-text-secondary">
                        Salin & gunakan saat booking
                      </span>
                    </div>

                    <Link
                      href={`/${params.locale}/booking`}
                      className="inline-flex items-center justify-center gap-1 h-10 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-semibold"
                    >
                      Pakai Sekarang <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cara pakai */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">
            Cara Pakai Kode Promo
          </h2>
          <ol className="space-y-3 text-sm text-text-secondary list-decimal list-inside">
            <li>Pilih lokasi, lapangan, dan jadwal yang kamu inginkan</li>
            <li>Di halaman konfirmasi, masukkan kode promo</li>
            <li>Klik &quot;Apply&quot; untuk mendapatkan potongan harga</li>
            <li>Selesaikan pembayaran dan tunggu konfirmasi admin</li>
          </ol>
          <div className="mt-4 p-3 rounded-lg bg-info/5 border border-info/20 text-xs text-text-secondary flex items-start gap-2">
            <Copy className="h-4 w-4 text-info mt-0.5 shrink-0" />
            <span>
              Member Silver/Gold dapat diskon otomatis (10%/20%) tanpa kode promo
              — kode promo bisa stack sesuai ketentuan.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
