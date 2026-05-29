import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { LocationForm } from "@/components/admin/LocationForm";

export default async function NewLocationPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/locations`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/locations`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar lokasi
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Tambah Lokasi Baru
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Buat lokasi cabang baru
        </p>
      </div>

      <LocationForm locale={params.locale} />
    </div>
  );
}
