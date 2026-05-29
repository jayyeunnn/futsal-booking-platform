import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import type { NotificationType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_TYPES = [
  "BOOKING",
  "PAYMENT",
  "PROMO",
  "MEMBERSHIP",
  "SYSTEM",
] as const;

export default async function NotificationsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { type?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);

  const filterRaw = searchParams.type;
  const filter =
    filterRaw && (VALID_TYPES as readonly string[]).includes(filterRaw)
      ? (filterRaw as NotificationType)
      : null;

  const where = {
    userId: session.id,
    ...(filter ? { type: filter } : {}),
  };

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: session.id, isRead: false },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Notifikasi
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {unread > 0
            ? `${unread} notifikasi belum dibaca`
            : "Semua notifikasi sudah dibaca"}
        </p>
      </div>

      <NotificationCenter
        locale={params.locale}
        initialItems={items.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          actionUrl: n.actionUrl,
          createdAt: n.createdAt.toISOString(),
        }))}
        initialUnread={unread}
        initialTotal={items.length}
      />
    </div>
  );
}
