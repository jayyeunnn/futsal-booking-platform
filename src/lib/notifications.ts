import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";
import type { NotificationType } from "@/types";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  /** Optional email payload — when provided, also dispatches an email. */
  email?: {
    subject: string;
    html: string;
    text?: string;
  };
  /**
   * If false, skip web-push fan-out for this notification.
   * Default true. Push is best-effort and never blocks creation.
   */
  push?: boolean;
};

/**
 * Create an in-app notification, optionally also emailing the user
 * and/or sending a Web Push notification to their registered devices.
 * Email and push failures are logged but never abort the in-app create.
 */
export async function createNotification(input: CreateNotificationInput) {
  const notif = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      actionUrl: input.actionUrl,
    },
  });

  if (input.email) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    });
    if (user?.email) {
      // Fire and forget — log on failure but don't throw.
      void sendEmail({
        to: user.email,
        subject: input.email.subject,
        html: input.email.html,
        text: input.email.text,
      }).catch((e) => console.error("[notifications] email dispatch failed", e));
    }
  }

  // Web Push fan-out — opt-out via `push: false` (default opt-in).
  if (input.push !== false) {
    void sendPushNotification(input.userId, {
      title: input.title,
      body: input.message,
      url: input.actionUrl ?? "/dashboard",
      tag: `notif-${input.type.toLowerCase()}`,
    }).catch((e) =>
      console.error("[notifications] push dispatch failed", e)
    );
  }

  return notif;
}

/** Mark a single notification as read for a user. */
export async function markAsRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

/** Mark all unread notifications as read for a user. */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/** Get unread count for the bell badge. */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
