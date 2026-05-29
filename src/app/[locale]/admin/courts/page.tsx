import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Camera, MapPin, Star, ImageIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AdminCourtsPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const courts = await prisma.court.findMany({
    include: {
      location: { select: { id: true, name: true, city: true } },
      _count: { select: { bookings: true, reviews: true } },
      reviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Manajemen Lapangan
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Kelola foto dan info lapangan
        </p>
      </div>

      {courts.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-text-secondary">Belum ada lapangan terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((c) => {
            const photos = (c.photos as string[] | null) ?? [];
            const cover = photos[0];
            const avgRating =
              c.reviews.length > 0
                ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
                : null;

            return (
              <div
                key={c.id}
                className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-text-secondary opacity-30" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!c.isActive && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-error/90 text-white">
                        Nonaktif
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-white flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      {photos.length}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="font-medium text-text-primary line-clamp-1">
                    {c.name}
                  </p>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />{" "}
                    {c.location.name} · {c.location.city}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                    <span>{c.type === "INDOOR" ? "Indoor" : "Outdoor"}</span>
                    {avgRating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {avgRating.toFixed(1)} ({c._count.reviews})
                      </span>
                    )}
                    <span>{c._count.bookings} booking</span>
                  </div>

                  <Link
                    href={`/${params.locale}/admin/courts/${c.id}/photos`}
                    className="mt-auto inline-flex items-center justify-center gap-1 h-9 rounded-lg border border-border hover:border-primary text-sm font-medium text-text-primary"
                  >
                    <Camera className="h-4 w-4" />
                    Kelola Foto
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
