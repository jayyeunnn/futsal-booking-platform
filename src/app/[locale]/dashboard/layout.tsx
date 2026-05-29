import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

/**
 * Server-rendered shell for the user dashboard.
 * Auth guard: redirects unauthenticated users to /login with callback.
 * Loads minimal user info (name, email, tier, avatar, role) needed by the
 * header/sidebar from DB so it's always fresh after profile updates.
 *
 * Note: role is passed down so the sidebar/header can show "Admin Panel"
 * link for ADMIN/STAFF users.
 */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) {
    redirect(
      `/${params.locale}/login?callbackUrl=/${params.locale}/dashboard`
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, tier: true, avatarUrl: true, role: true },
  });

  if (!user) {
    // Stale session — force re-auth.
    redirect(`/${params.locale}/login`);
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
        email: user.email,
        tier: user.tier,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
