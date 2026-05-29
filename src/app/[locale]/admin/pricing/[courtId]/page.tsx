import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { PricingMatrix } from "@/components/admin/PricingMatrix";

export const dynamic = "force-dynamic";

export default async function CourtPricingPage({
  params,
}: {
  params: { locale: string; courtId: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/pricing`);
  }

  const court = await prisma.court.findUnique({
    where: { id: params.courtId },
    include: {
      location: { select: { name: true, city: true } },
      pricing: {
        orderBy: [{ dayType: "asc" }, { timeType: "asc" }],
      },
    },
  });
  if (!court) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/pricing`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar harga
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Harga · {court.name}
        </h1>
        <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {court.location.name}, {court.location.city}
          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted">
            {court.type === "INDOOR" ? "Indoor" : "Outdoor"}
          </span>
        </p>
      </div>

      <PricingMatrix
        courtId={court.id}
        initialRows={court.pricing.map((p) => ({
          id: p.id,
          dayType: p.dayType,
          timeType: p.timeType,
          startHour: p.startHour,
          endHour: p.endHour,
          pricePerHour: String(Number(p.pricePerHour)),
          isActive: p.isActive,
        }))}
      />
    </div>
  );
}
