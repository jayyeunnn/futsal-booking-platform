import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, User, Shield, Briefcase } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminUserActionButtons } from "@/components/admin/AdminUserActionButtons";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import type { Prisma, UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

const ROLE_BADGE: Record<UserRole, string> = {
  ADMIN: "bg-error/10 text-error",
  STAFF: "bg-info/10 text-info",
  USER: "bg-muted text-text-secondary",
};

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { role?: string; search?: string; page?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/dashboard`);
  }

  const validRoles: UserRole[] = ["USER", "STAFF", "ADMIN"];
  const roleParam = searchParams.role;
  const role =
    roleParam && (validRoles as string[]).includes(roleParam)
      ? (roleParam as UserRole)
      : null;
  const search = searchParams.search?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;

  // Default scope: STAFF + ADMIN saja. Pass `?role=USER` untuk lihat customer.
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : { role: { in: ["STAFF", "ADMIN"] } }),
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

  const [users, total, summary] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        tier: true,
        isActive: true,
        provider: true,
        createdAt: true,
      },
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const counts: Record<UserRole, number> = {
    USER: 0,
    STAFF: 0,
    ADMIN: 0,
  };
  for (const row of summary) counts[row.role] = row._count._all;

  const totalPages = Math.ceil(total / limit);
  const dateLocale = params.locale === "id" ? idLocale : enUS;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Manajemen User & Staff
          </h1>
          <p className="text-sm text-text-secondary">
            Kelola akun admin & staff. Customer (USER role) ada di Manajemen
            Member.
          </p>
        </div>
        <Link
          href={`/${params.locale}/admin/users/new`}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> Tambah Staff
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-error" />
            <p className="text-xs text-text-secondary">Admin</p>
          </div>
          <p className="text-2xl font-heading font-bold text-error">
            {counts.ADMIN}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-info" />
            <p className="text-xs text-text-secondary">Staff</p>
          </div>
          <p className="text-2xl font-heading font-bold text-info">
            {counts.STAFF}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-text-secondary" />
            <p className="text-xs text-text-secondary">Customer</p>
          </div>
          <p className="text-2xl font-heading font-bold text-text-primary">
            {counts.USER}
          </p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Cari nama, email, atau no. HP..."
        select={{
          paramName: "role",
          allLabel: "Staff & Admin",
          options: [
            { value: "ADMIN", label: "Admin" },
            { value: "STAFF", label: "Staff" },
            { value: "USER", label: "Customer (USER)" },
          ],
        }}
      />

      {users.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl">
          <EmptyState
            variant="no-data"
            title="Belum ada staff"
            description="Tambah staff pertama untuk delegasi konfirmasi booking & payment."
            action={{
              label: "Tambah Staff",
              href: `/${params.locale}/admin/users/new`,
            }}
          />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-text-secondary text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Bergabung</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={`hover:bg-muted/30 ${!u.isActive ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {u.name}
                        {u.id === session.id && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-cta/10 text-cta">
                            Anda
                          </span>
                        )}
                      </p>
                      {u.provider && u.provider !== "credentials" && (
                        <p className="text-[10px] text-text-secondary capitalize">
                          via {u.provider}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary line-clamp-1">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {u.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${ROLE_BADGE[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          u.isActive
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {format(u.createdAt, "dd MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminUserActionButtons
                        userId={u.id}
                        isActive={u.isActive}
                        isSelf={u.id === session.id}
                        locale={params.locale}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border text-sm text-text-secondary">
              <span>
                Halaman {page} dari {totalPages} ({total} user)
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/${params.locale}/admin/users?${new URLSearchParams(
                      {
                        ...(search ? { search } : {}),
                        ...(role ? { role } : {}),
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
                    href={`/${params.locale}/admin/users?${new URLSearchParams(
                      {
                        ...(search ? { search } : {}),
                        ...(role ? { role } : {}),
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
      )}
    </div>
  );
}
