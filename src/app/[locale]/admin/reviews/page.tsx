import Link from "next/link";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { StarRating } from "@/components/dashboard/StarRating";
import { ReviewVisibilityToggle } from "@/components/admin/ReviewVisibilityToggle";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { visibility?: string; search?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const visibility =
    searchParams.visibility === "visible" ||
    searchParams.visibility === "hidden"
      ? searchParams.visibility
      : "all";
  const search = searchParams.search?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const where: Prisma.ReviewWhereInput = {
    ...(visibility === "visible" && { isVisible: true }),
    ...(visibility === "hidden" && { isVisible: false }),
    ...(search
      ? {
          OR: [
            { comment: { contains: search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [reviews, total, summary, hiddenCount] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, tier: true } },
        court: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.review.count({ where: { isVisible: false } }),
  ]);

  const dateLocale = params.locale === "id" ? idLocale : enUS;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Moderasi Review
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Tampilkan atau sembunyikan review user
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Total Review</p>
          <p className="text-2xl font-heading font-bold text-text-primary">
            {summary._count._all}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Rata-rata</p>
          <p className="text-2xl font-heading font-bold text-warning flex items-center gap-1">
            <Star className="h-5 w-5 fill-warning" />
            {summary._avg.rating ? summary._avg.rating.toFixed(2) : "—"}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Hidden</p>
          <p className="text-2xl font-heading font-bold text-error">
            {hiddenCount}
          </p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Cari komentar, nama, email..."
        select={{
          paramName: "visibility",
          allLabel: "Semua",
          options: [
            { value: "visible", label: "Tampil" },
            { value: "hidden", label: "Hidden" },
          ],
        }}
      />

      <div className="bg-surface border border-border rounded-xl">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            Tidak ada review ditemukan.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {r.user.name}
                      </p>
                      <span className="text-[10px] font-bold px-1.5 rounded bg-muted text-text-secondary">
                        {r.user.tier}
                      </span>
                      <span className="text-xs text-text-secondary">
                        · {r.court.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating value={r.rating} size="sm" />
                      <span className="text-xs text-text-secondary">
                        {r.rating}/5 ·{" "}
                        {format(r.createdAt, "dd MMM yyyy HH:mm", {
                          locale: dateLocale,
                        })}
                      </span>
                    </div>
                    {r.comment ? (
                      <p
                        className={`text-sm whitespace-pre-wrap ${
                          r.isVisible
                            ? "text-text-primary"
                            : "text-text-secondary line-through"
                        }`}
                      >
                        {r.comment}
                      </p>
                    ) : (
                      <p className="text-sm text-text-secondary italic">
                        (tanpa komentar)
                      </p>
                    )}
                  </div>
                  <ReviewVisibilityToggle
                    reviewId={r.id}
                    isVisible={r.isVisible}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
            <span>
              Halaman {page} dari {totalPages} ({total} review)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/${params.locale}/admin/reviews?${new URLSearchParams(
                    {
                      ...(search ? { search } : {}),
                      ...(visibility !== "all" ? { visibility } : {}),
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
                  href={`/${params.locale}/admin/reviews?${new URLSearchParams(
                    {
                      ...(search ? { search } : {}),
                      ...(visibility !== "all" ? { visibility } : {}),
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
    </div>
  );
}
