import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { FavoriteToggle } from "@/components/dashboard/FavoriteToggle";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function DashboardFavoritesPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: {
      court: {
        include: {
          location: { select: { id: true, name: true, address: true } },
          pricing: { where: { isActive: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Lapangan Favorit
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Quick re-book lapangan langgananmu
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-favorites"
            action={{
              label: "Cari Lapangan",
              href: `/${params.locale}/booking`,
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((f) => {
            const minPrice = Math.min(
              ...f.court.pricing.map((p) => Number(p.pricePerHour))
            );
            return (
              <div
                key={f.id}
                className="bg-surface border border-border rounded-xl p-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary line-clamp-1">
                      {f.court.name}
                    </p>
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {f.court.type === "INDOOR" ? "Indoor" : "Outdoor"} ·{" "}
                      {f.court.surface ?? "—"}
                    </p>
                  </div>
                  <FavoriteToggle
                    courtId={f.courtId}
                    initialFavorited={true}
                  />
                </div>

                <p className="text-xs text-text-secondary flex items-center gap-1 mb-3">
                  <MapPin className="h-3 w-3" /> {f.court.location.name}
                </p>

                {f.court.pricing.length > 0 && Number.isFinite(minPrice) && (
                  <p className="text-sm text-text-secondary mb-3">
                    Mulai dari{" "}
                    <span className="font-bold text-text-primary">
                      {formatRupiah(minPrice)}
                    </span>
                    /jam
                  </p>
                )}

                <div className="mt-auto">
                  <Link
                    href={`/${params.locale}/booking/${f.court.location.id}/${f.court.id}`}
                    className="inline-flex items-center justify-center w-full h-9 bg-cta hover:bg-cta-hover text-white text-sm font-semibold rounded-lg"
                  >
                    Booking Sekarang
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
