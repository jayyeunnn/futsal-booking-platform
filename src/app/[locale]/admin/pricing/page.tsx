import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MapPin, ImageIcon, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminPricingPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { search?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const search = searchParams.search?.trim();
  const where: Prisma.CourtWhereInput = {
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            {
              location: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const courts = await prisma.court.findMany({
    where,
    include: {
      location: { select: { name: true } },
      pricing: {
        where: { isActive: true },
        select: {
          dayType: true,
          timeType: true,
          pricePerHour: true,
        },
      },
    },
    orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
  });

  // Group pricing per court for matrix view.
  const buildMatrix = (
    pricing: { dayType: string; timeType: string; pricePerHour: unknown }[]
  ) => {
    const get = (day: string, time: string) =>
      pricing.find((p) => p.dayType === day && p.timeType === time);
    return {
      weekdayRegular: get("WEEKDAY", "REGULAR"),
      weekdayPrime: get("WEEKDAY", "PRIME_TIME"),
      weekendRegular: get("WEEKEND", "REGULAR"),
      weekendPrime: get("WEEKEND", "PRIME_TIME"),
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
          Manajemen Harga
        </h1>
        <p className="text-sm text-text-secondary">
          Set harga per jam untuk tiap lapangan, weekday/weekend × regular/prime
          time
        </p>
      </div>

      <AdminFilterBar searchPlaceholder="Cari nama lapangan atau lokasi..." />

      {courts.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-data"
            title="Tidak ada lapangan"
            description="Tambahkan lapangan dulu di Manajemen Lapangan untuk bisa set harga."
            action={{
              label: "Buka Manajemen Lapangan",
              href: `/${params.locale}/admin/courts`,
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {courts.map((court) => {
            const matrix = buildMatrix(court.pricing);
            const cover = (court.photos as string[] | null)?.[0];
            const isComplete =
              matrix.weekdayRegular &&
              matrix.weekdayPrime &&
              matrix.weekendRegular &&
              matrix.weekendPrime;

            return (
              <Link
                key={court.id}
                href={`/${params.locale}/admin/pricing/${court.id}`}
                className="block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Cover */}
                  <div className="relative w-full sm:w-32 h-24 sm:h-auto bg-muted shrink-0">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={court.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-text-secondary opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Info + Matrix */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary line-clamp-1">
                          {court.name}
                        </p>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {court.location.name}
                          <span className="ml-2 text-[10px] font-bold px-1.5 rounded bg-muted">
                            {court.type === "INDOOR" ? "Indoor" : "Outdoor"}
                          </span>
                        </p>
                      </div>
                      {!isComplete && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-warning/10 text-warning">
                          Harga belum lengkap
                        </span>
                      )}
                    </div>

                    {/* Pricing matrix preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <PricingCell
                        label="Weekday Regular"
                        value={
                          matrix.weekdayRegular
                            ? formatRupiah(
                                Number(matrix.weekdayRegular.pricePerHour)
                              )
                            : null
                        }
                      />
                      <PricingCell
                        label="Weekday Prime"
                        value={
                          matrix.weekdayPrime
                            ? formatRupiah(
                                Number(matrix.weekdayPrime.pricePerHour)
                              )
                            : null
                        }
                        accent
                      />
                      <PricingCell
                        label="Weekend Regular"
                        value={
                          matrix.weekendRegular
                            ? formatRupiah(
                                Number(matrix.weekendRegular.pricePerHour)
                              )
                            : null
                        }
                      />
                      <PricingCell
                        label="Weekend Prime"
                        value={
                          matrix.weekendPrime
                            ? formatRupiah(
                                Number(matrix.weekendPrime.pricePerHour)
                              )
                            : null
                        }
                        accent
                      />
                    </div>

                    <div className="flex items-center justify-end mt-3 text-xs text-primary">
                      <span className="font-medium">Edit harga</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PricingCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | null;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-2 rounded border ${
        accent ? "border-cta/20 bg-cta/5" : "border-border bg-muted/30"
      }`}
    >
      <p className="text-[10px] text-text-secondary line-clamp-1">{label}</p>
      <p
        className={`text-sm font-semibold mt-0.5 ${
          value ? (accent ? "text-cta" : "text-text-primary") : "text-text-secondary"
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
