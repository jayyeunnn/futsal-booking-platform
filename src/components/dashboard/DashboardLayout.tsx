import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

type Props = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    tier: string;
    avatarUrl: string | null;
    role: "USER" | "STAFF" | "ADMIN";
  };
};

/**
 * Outer chrome for every /dashboard/* page.
 * The page-specific content is rendered as children.
 */
export default function DashboardLayout({ children, user }: Props) {
  return (
    <div className="min-h-screen bg-muted">
      <DashboardSidebar role={user.role} />
      <div className="lg:pl-64">
        <DashboardHeader
          userName={user.name}
          userEmail={user.email}
          userTier={user.tier}
          avatarUrl={user.avatarUrl}
          role={user.role}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
