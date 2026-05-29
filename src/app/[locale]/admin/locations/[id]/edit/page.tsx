import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { LocationForm } from "@/components/admin/LocationForm";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/admin/locations`);
  }

  const location = await prisma.location.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { courts: true } },
    },
  });
  if (!location) notFound();

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
          Edit Lokasi
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {location._count.courts} lapangan terdaftar di lokasi ini
        </p>
      </div>

      <LocationForm
        locale={params.locale}
        locationId={location.id}
        defaultValues={{
          name: location.name,
          address: location.address,
          city: location.city,
          phone: location.phone ?? "",
          email: location.email ?? "",
          latitude: location.latitude ? String(location.latitude) : "",
          longitude: location.longitude ? String(location.longitude) : "",
          openTime: location.openTime,
          closeTime: location.closeTime,
          thumbnailUrl: location.thumbnailUrl ?? "",
          description: location.description ?? "",
          isActive: location.isActive,
        }}
      />
    </div>
  );
}
