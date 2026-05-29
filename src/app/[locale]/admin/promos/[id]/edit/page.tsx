import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { PromoForm } from "@/components/admin/PromoForm";

export const dynamic = "force-dynamic";

export default async function EditPromoPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/promos`);
  }

  const promo = await prisma.promo.findUnique({
    where: { id: params.id },
  });
  if (!promo) notFound();

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
          Edit Promo:{" "}
          <code className="text-cta font-mono">{promo.code}</code>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Sudah dipakai {promo.usageCount}x
        </p>
      </div>

      <PromoForm
        locale={params.locale}
        promoId={promo.id}
        defaultValues={{
          code: promo.code,
          title: promo.title,
          description: promo.description ?? "",
          discountType: promo.discountType,
          discountValue: String(Number(promo.discountValue)),
          minBooking: promo.minBooking ? String(Number(promo.minBooking)) : "",
          maxDiscount: promo.maxDiscount
            ? String(Number(promo.maxDiscount))
            : "",
          usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
          perUserLimit: String(promo.perUserLimit),
          memberOnly: promo.memberOnly,
          minTier: promo.minTier ?? "",
          startDate: promo.startDate.toISOString(),
          endDate: promo.endDate.toISOString(),
          isActive: promo.isActive,
        }}
      />
    </div>
  );
}
