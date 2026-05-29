import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { RewardForm } from "@/components/admin/RewardForm";

export default async function NewRewardPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/rewards`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/rewards`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar reward
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Buat Reward Baru
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Tambah reward baru ke katalog reward store
        </p>
      </div>

      <RewardForm locale={params.locale} />
    </div>
  );
}
