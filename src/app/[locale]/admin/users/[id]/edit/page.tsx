import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const dynamic = "force-dynamic";

export default async function EditAdminUserPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/users`);
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      provider: true,
    },
  });
  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/users`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar user
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Edit User
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Update info, role, atau reset password
          {user.id === session.id && (
            <span className="ml-2 text-cta font-medium">
              · Akun Anda sendiri
            </span>
          )}
        </p>
      </div>

      <AdminUserForm
        locale={params.locale}
        userId={user.id}
        defaultValues={{
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          role: user.role,
          isActive: user.isActive,
        }}
      />
    </div>
  );
}
