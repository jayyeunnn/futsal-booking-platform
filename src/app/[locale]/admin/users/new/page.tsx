import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export default async function NewAdminUserPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/users`);
  }

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
          Tambah Staff Baru
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Buat akun staff atau admin baru
        </p>
      </div>

      <AdminUserForm
        locale={params.locale}
        defaultValues={{ role: "STAFF" }}
      />
    </div>
  );
}
