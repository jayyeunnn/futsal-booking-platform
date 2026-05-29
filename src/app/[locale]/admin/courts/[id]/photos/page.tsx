import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { CourtPhotoManager } from "@/components/admin/CourtPhotoManager";

export const dynamic = "force-dynamic";

export default async function CourtPhotosPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const court = await prisma.court.findUnique({
    where: { id: params.id },
    include: {
      location: { select: { name: true, city: true } },
    },
  });
  if (!court) notFound();

  const photos = (court.photos as string[] | null) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/admin/courts`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar lapangan
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Foto · {court.name}
        </h1>
        <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {court.location.name}, {court.location.city}
        </p>
      </div>

      <CourtPhotoManager courtId={court.id} initialPhotos={photos} />
    </div>
  );
}
