import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import PushNotificationToggle from "@/components/dashboard/PushNotificationToggle";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      tier: true,
      provider: true,
    },
  });
  if (!user) redirect(`/${params.locale}/login`);

  const canChangePassword =
    user.provider === "credentials" || user.provider === null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Profil
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Kelola informasi akun kamu
        </p>
      </div>

      <ProfileForm
        defaultValues={{
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          avatarUrl: user.avatarUrl ?? "",
        }}
      />

      {/* Security section */}
      <div className="mt-6 bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold mb-1">Keamanan</h2>
        <p className="text-sm text-text-secondary mb-4">
          Ubah password akun kamu secara berkala
        </p>

        {canChangePassword ? (
          <Link
            href={`/${params.locale}/dashboard/profile/password`}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-border hover:border-primary text-sm font-medium text-text-primary transition-colors"
          >
            <Lock className="h-4 w-4" />
            Ubah Password
          </Link>
        ) : (
          <p className="text-sm text-text-secondary bg-muted rounded-lg p-3">
            Akun kamu login lewat penyedia eksternal ({user.provider}). Ubah
            password lewat akun penyedia tersebut.
          </p>
        )}
      </div>

      {/* Push notifications section */}
      <div className="mt-6">
        <h2 className="text-lg font-heading font-semibold mb-1">
          Notifikasi Push
        </h2>
        <p className="text-sm text-text-secondary mb-3">
          Dapatkan notifikasi langsung di perangkat ini, bahkan saat browser
          tertutup.
        </p>
        <PushNotificationToggle />
      </div>
    </div>
  );
}
