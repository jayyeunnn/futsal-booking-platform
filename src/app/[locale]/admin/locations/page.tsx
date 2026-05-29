import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, MapPin, ImageIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { LocationActionButtons } from "@/components/admin/LocationActionButtons";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const status = searchParams.status;
  const search = searchParams.search?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const where: Prisma.LocationWhereInput = {
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [locations, total, summary] = await Promise.all([
    prisma.location.findMany({
      where,
      include: {
        courts: {
          where: { isActive: true },
          select: { id: true, type: true },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.location.count({ where }),
    prisma.location.groupBy({
      by: ["isActive"],
      _count: { _all: true },
    }),
  ]);

  let activeCount = 0;
  let inactiveCount = 0;
  for (const row of summary) {
    if (row.isActive) activeCount = row._count._all;
    else inactiveCount = row._count._all;
  }

  const totalPages = Math.ceil(total / limit);
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Manajemen Lokasi
          </h1>
          <p className="text-sm text-text-secondary">
            Kelola lokasi cabang JayField
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/${params.locale}/admin/locations/new`}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Tambah Lokasi
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Aktif</p>
          <p className="text-2xl font-heading font-bold text-success">
            {activeCount}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Nonaktif</p>
          <p className="text-2xl font-heading font-bold text-text-secondary">
            {inactiveCount}
          </p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Cari nama, kota, atau alamat..."
        select={{
          paramName: "status",
          allLabel: "Semua Status",
          options: [
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Nonaktif" },
          ],
        }}
      />

      {locations.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-locations"
            title="Belum ada lokasi"
            description="Tambah lokasi pertama untuk mulai menerima booking."
            action={
              isAdmin
                ? {
                    label: "Tambah Lokasi",
                    href: `/${params.locale}/admin/locations/new`,
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const indoorCount = loc.courts.filter(
              (c) => c.type === "INDOOR"
            ).length;
            const outdoorCount = loc.courts.filter(
              (c) => c.type === "OUTDOOR"
            ).length;

            return (
              <div
                key={loc.id}
                className={`bg-surface border border-border rounded-xl overflow-hidden flex flex-col ${
                  !loc.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  {loc.thumbnailUrl ? (
                    <Image
                      src={loc.thumbnailUrl}
                      alt={loc.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-text-secondary opacity-30" />
                  )}
                  {!loc.isActive && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded bg-error/90 text-white">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="font-medium text-text-primary line-clamp-1">
                    {loc.name}
                  </p>
                  <p className="text-xs text-text-secondary flex items-start gap-1 mt-1">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">
                      {loc.address}, {loc.city}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-3">
                    <span>{loc.courts.length} Lapangan</span>
                    {indoorCount > 0 && <span>· {indoorCount} Indoor</span>}
                    {outdoorCount > 0 && <span>· {outdoorCount} Outdoor</span>}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {loc.openTime} - {loc.closeTime}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-end">
                    <LocationActionButtons
                      locationId={loc.id}
                      isActive={loc.isActive}
                      locale={params.locale}
                      courtCount={loc.courts.length}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Halaman {page} dari {totalPages} ({total} lokasi)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/${params.locale}/admin/locations?${new URLSearchParams(
                  {
                    ...(search ? { search } : {}),
                    ...(status ? { status } : {}),
                    page: String(page - 1),
                  }
                )}`}
                className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
              >
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/${params.locale}/admin/locations?${new URLSearchParams(
                  {
                    ...(search ? { search } : {}),
                    ...(status ? { status } : {}),
                    page: String(page + 1),
                  }
                )}`}
                className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-xs"
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
