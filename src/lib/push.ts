import webpush from "web-push";
import prisma from "@/lib/prisma";

/**
 * Web Push helper — wraps `web-push` with VAPID config + per-user fan-out
 * across all of that user's registered subscriptions (multi-device).
 *
 * If VAPID keys are not configured, all calls become no-ops so the app
 * keeps working in dev without keys. Generate keys with:
 *
 *   npx tsx scripts/generate-vapid-keys.ts
 *
 * then set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL in .env.
 */

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:hello@jayfield.com";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

export function getVapidPublicKey(): string | null {
  return VAPID_PUBLIC_KEY ?? null;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
};

/**
 * Send a push notification to all registered subscriptions of a user.
 * Best-effort — failures are logged but never thrown to callers, so this
 * is safe to fire-and-forget alongside email/in-app notifications.
 *
 * Subscriptions returning 404/410 (gone) are pruned automatically.
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; pruned: number }> {
  if (!ensureConfigured()) {
    return { sent: 0, pruned: 0 };
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { id: true, endpoint: true, keys: true },
  });

  if (subs.length === 0) return { sent: 0, pruned: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  let pruned = 0;
  const toDelete: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      const keys = s.keys as { p256dh?: string; auth?: string } | null;
      if (!keys?.p256dh || !keys?.auth) {
        toDelete.push(s.id);
        return;
      }
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
          },
          body
        );
        sent += 1;
      } catch (e: unknown) {
        const status =
          (e as { statusCode?: number })?.statusCode ?? undefined;
        // 404 / 410 mean the subscription is permanently gone.
        if (status === 404 || status === 410) {
          toDelete.push(s.id);
        } else {
          console.error("[push] send failed", { endpoint: s.endpoint, status });
        }
      }
    })
  );

  if (toDelete.length > 0) {
    pruned = toDelete.length;
    await prisma.pushSubscription
      .deleteMany({ where: { id: { in: toDelete } } })
      .catch((e) => console.error("[push] prune failed", e));
  }

  return { sent, pruned };
}
