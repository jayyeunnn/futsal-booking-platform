import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { RewardForm } from "@/components/admin/RewardForm";

export const dynamic = "force-dynamic";

export default async function EditRewardPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/rewards`);
  }

  const reward = await prisma.reward.findUnique({
    where: { id: params.id },
  });
  if (!reward) notFound();

  const redemptionCount = await prisma.redemption.count({
    where: { rewardKey: reward.code },
  });

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
          Edit Reward:{" "}
          <code className="text-cta font-mono">{reward.code}</code>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Sudah ditukar {redemptionCount}x
        </p>
      </div>

      <RewardForm
        locale={params.locale}
        rewardId={reward.id}
        redemptionCount={redemptionCount}
        defaultValues={{
          code: reward.code,
          name: reward.name,
          nameEn: reward.nameEn ?? "",
          description: reward.description ?? "",
          descriptionEn: reward.descriptionEn ?? "",
          pointsCost: String(reward.pointsCost),
          type: reward.type,
          value: String(reward.value),
          validForDays: String(reward.validForDays),
          minTier: reward.minTier ?? "",
          isActive: reward.isActive,
          sortOrder: String(reward.sortOrder),
        }}
      />
    </div>
  );
}
