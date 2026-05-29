import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { passwordHash: true, provider: true },
  });

  // OAuth-only users can't change password — bounce them back.
  if (!user || (!user.passwordHash && user.provider && user.provider !== "credentials")) {
    redirect(`/${params.locale}/dashboard/profile`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/${params.locale}/dashboard/profile`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Profil
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Ubah Password
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Pastikan password baru kuat dan tidak digunakan di tempat lain
        </p>
      </div>

      <ChangePasswordForm locale={params.locale} />
    </div>
  );
}
