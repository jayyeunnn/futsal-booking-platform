import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ImageIcon, Receipt } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { getTranslations } from "next-intl/server";
import { PaymentActionButtons } from "@/components/admin/PaymentActionButtons";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const TAB_FILTER: Record<"pending" | "confirmed" | "rejected", string[]> = {
  pending: ["UPLOADED"],
  confirmed: ["CONFIRMED"],
  rejected: ["REJECTED", "EXPIRED"],
};

export default async function AdminPaymentsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { tab?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  const t = await getTranslations("admin");

  const tab =
    searchParams.tab === "confirmed" || searchParams.tab === "rejected"
      ? searchParams.tab
      : "pending";

  // Counts for all tabs
  const [pendingCount, confirmedCount, rejectedCount, payments] =
    await Promise.all([
      prisma.payment.count({ where: { status: { in: TAB_FILTER.pending as never } } }),
      prisma.payment.count({ where: { status: { in: TAB_FILTER.confirmed as never } } }),
      prisma.payment.count({ where: { status: { in: TAB_FILTER.rejected as never } } }),
      prisma.payment.findMany({
        where: {
          status: { in: TAB_FILTER[tab] as never },
        },
        include: {
          booking: {
            include: {
              user: { select: { name: true, email: true } },
              court: {
                include: { location: { select: { name: true } } },
              },
            },
          },
          confirmedBy: { select: { name: true } },
        },
        orderBy:
          tab === "pending"
            ? { updatedAt: "asc" } // oldest first for processing queue
            : { updatedAt: "desc" },
        take: 50,
      }),
    ]);

  const dateLocale = params.locale === "id" ? idLocale : enUS;

  type Tab = "pending" | "confirmed" | "rejected";
  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "pending", label: "Menunggu", count: pendingCount },
    { key: "confirmed", label: "Dikonfirmasi", count: confirmedCount },
    { key: "rejected", label: "Ditolak", count: rejectedCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
          {t("payments")}
        </h1>
        <p className="text-sm text-text-secondary">
          Verifikasi bukti transfer & konfirmasi pembayaran
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tabItem) => {
          const isActive = tab === tabItem.key;
          return (
            <Link
              key={tabItem.key}
              href={`/${params.locale}/admin/payments?tab=${tabItem.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:bg-muted"
              }`}
            >
              {tabItem.label}{" "}
              <span
                className={`ml-1 text-xs ${isActive ? "text-white/80" : "text-text-secondary"}`}
              >
                ({tabItem.count})
              </span>
            </Link>
          );
        })}
      </div>

      {payments.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-data"
            title={
              tab === "pending"
                ? "Tidak ada pembayaran menunggu 🎉"
                : tab === "confirmed"
                  ? "Belum ada pembayaran terkonfirmasi"
                  : "Belum ada pembayaran ditolak"
            }
            description={
              tab === "pending"
                ? "Semua pembayaran sudah diverifikasi. Bagus!"
                : "Pembayaran akan muncul di sini setelah ada aksi."
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-text-secondary">
                      {p.bookingId.slice(0, 12)}…
                    </span>
                    <span className="text-sm font-semibold text-text-primary">
                      — {p.booking.user.name}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    {p.booking.user.email}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-text-primary">
                        Lapangan:
                      </span>{" "}
                      <span className="text-text-secondary">
                        {p.booking.court.name},{" "}
                        {p.booking.court.location.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">
                        Jadwal:
                      </span>{" "}
                      <span className="text-text-secondary">
                        {format(p.booking.bookingDate, "dd MMM yyyy", {
                          locale: dateLocale,
                        })}
                        , {p.booking.startTime}-{p.booking.endTime}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">
                        Tipe:
                      </span>{" "}
                      <span className="text-text-secondary">
                        {p.paymentType === "DP" ? "DP (50%)" : "Bayar Full"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">
                        Metode:
                      </span>{" "}
                      <span className="text-text-secondary">
                        {p.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      Jumlah:
                    </span>
                    <span className="text-lg font-heading font-bold text-primary">
                      {formatRupiah(Number(p.amount))}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mt-2">
                    Update terakhir:{" "}
                    {format(p.updatedAt, "dd MMM yyyy HH:mm", {
                      locale: dateLocale,
                    })}
                    {p.confirmedBy && ` · oleh ${p.confirmedBy.name}`}
                  </p>

                  {p.notes && tab === "rejected" && (
                    <div className="mt-3 p-2 rounded-lg bg-error/5 border border-error/20 text-xs text-error">
                      <strong>Alasan:</strong> {p.notes}
                    </div>
                  )}
                </div>

                {/* Right: Proof image + Actions */}
                <div className="flex flex-col gap-3 lg:w-72">
                  {p.proofImageUrl ? (
                    <a
                      href={p.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                    >
                      <Image
                        src={p.proofImageUrl}
                        alt="Bukti transfer"
                        fill
                        className="object-cover"
                        sizes="288px"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded transition-opacity">
                          {t("view_proof")}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="aspect-video bg-muted border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1">
                      <ImageIcon className="h-6 w-6 text-text-secondary opacity-30" />
                      <span className="text-xs text-text-secondary">
                        Bukti belum diupload
                      </span>
                    </div>
                  )}

                  {tab === "pending" && p.proofImageUrl && (
                    <PaymentActionButtons paymentId={p.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pending" && payments.length > 0 && (
        <p className="text-xs text-text-secondary text-center">
          <Receipt className="h-3 w-3 inline mr-1" />
          Tip: konfirmasi pembayaran sesuai urutan upload — yang lama dulu
        </p>
      )}
    </div>
  );
}
