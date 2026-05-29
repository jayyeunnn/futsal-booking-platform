import Link from "next/link";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";

export const dynamic = "force-dynamic";

const TIER_BADGE: Record<string, string> = {
  BRONZE: "bg-amber-700/10 text-amber-700",
  SILVER: "bg-slate-300/40 text-slate-700",
  GOLD: "bg-yellow-100 text-yellow-700",
};

export default async function AdminMembersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { search?: string; tier?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const search = searchParams.search?.trim();
  const tierParam = searchParams.tier;
  const tier =
    tierParam === "BRONZE" || tierParam === "SILVER" || tierParam === "GOLD"
      ? tierParam
      : null;
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  const where: Prisma.UserWhereInput = {
    role: "USER",
    ...(tier ? { tier } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [members, total, stats] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        tier: true,
        totalPoints: true,
        totalBookings: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["tier"],
      where: { role: "USER" },
      _count: { _all: true },
    }),
  ]);

  const tierCount = {
    BRONZE: 0,
    SILVER: 0,
    GOLD: 0,
  };
  for (const s of stats) {
    tierCount[s.tier] = s._count._all;
  }
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Manajemen Member
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Kelola tier, poin, dan info member
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">BRONZE</p>
          <p className="text-2xl font-heading font-bold text-amber-700">
            {tierCount.BRONZE}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">SILVER</p>
          <p className="text-2xl font-heading font-bold text-slate-700">
            {tierCount.SILVER}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">GOLD</p>
          <p className="text-2xl font-heading font-bold text-yellow-700">
            {tierCount.GOLD}
          </p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilterBar
        searchPlaceholder="Cari nama, email, atau no. HP..."
        select={{
          paramName: "tier",
          allLabel: "Semua Tier",
          options: [
            { value: "BRONZE", label: "BRONZE" },
            { value: "SILVER", label: "SILVER" },
            { value: "GOLD", label: "GOLD" },
          ],
        }}
      />

      {/* List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            Tidak ada member ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-text-secondary text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium text-right">Poin</th>
                  <th className="px-4 py-3 font-medium text-right">Booking</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{m.name}</p>
                      <p className="text-xs text-text-secondary">
                        Bergabung{" "}
                        {m.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      <p>{m.email}</p>
                      {m.phone && <p>{m.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${TIER_BADGE[m.tier]}`}
                      >
                        {m.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-cta">
                      {m.totalPoints.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">
                      {m.totalBookings}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          m.isActive
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {m.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${params.locale}/admin/members/${m.id}`}
                        className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                      >
                        Detail <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
            <span>
              Halaman {page} dari {totalPages} ({total} member)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/${params.locale}/admin/members?${new URLSearchParams(
                    {
                      ...(search ? { search } : {}),
                      ...(tier ? { tier } : {}),
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
                  href={`/${params.locale}/admin/members?${new URLSearchParams(
                    {
                      ...(search ? { search } : {}),
                      ...(tier ? { tier } : {}),
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
