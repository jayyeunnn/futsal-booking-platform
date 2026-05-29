import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { PromoForm } from "@/components/admin/PromoForm";

export default async function NewPromoPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/promos`);
  }

  // Default: 7-day promo starting now
  const now = new Date();
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/promos`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar promo
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Buat Promo Baru
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Buat kode diskon baru untuk customer
        </p>
      </div>

      <PromoForm
        locale={params.locale}
        defaultValues={{
          startDate: now.toISOString(),
          endDate: oneWeek.toISOString(),
        }}
      />
    </div>
  );
}
