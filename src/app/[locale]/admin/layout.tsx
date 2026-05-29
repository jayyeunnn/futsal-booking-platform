import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import AdminLayout from "@/components/admin/AdminLayout";

/**
 * Server-rendered guard for admin pages.
 * - Unauthenticated users → /login with callback to admin.
 * - Authenticated USER role → /dashboard (not allowed in admin).
 * - ADMIN/STAFF pass through.
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
      `/${params.locale}/login?callbackUrl=/${params.locale}/admin`
    );
  }
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  return <AdminLayout>{children}</AdminLayout>;
}
