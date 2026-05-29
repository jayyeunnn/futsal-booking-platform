import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { getVapidPublicKey } from "@/lib/push";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().max(500).optional(),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

/**
 * GET /api/notifications/subscribe
 * Returns the VAPID public key so the client can call
 * `pushManager.subscribe({ applicationServerKey })`.
 */
export async function GET() {
  try {
    await requireUser();
    return ok({ publicKey: getVapidPublicKey() });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    return errors.server();
  }
}

/**
 * POST /api/notifications/subscribe
 * Persist a user's push subscription. Idempotent on `endpoint` —
 * re-subscribing with the same endpoint just refreshes the keys
 * and reassigns the row to the current user (e.g. after re-login).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        "Subscription tidak valid",
        parsed.error.flatten()
      );
    }

    const { endpoint, keys, userAgent } = parsed.data;

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId: auth.id,
          keys,
          userAgent: userAgent ?? existing.userAgent,
        },
      });
      return ok({ ok: true });
    }

    await prisma.pushSubscription.create({
      data: {
        userId: auth.id,
        endpoint,
        keys,
        userAgent: userAgent ?? null,
      },
    });

    return created({ ok: true });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("POST /api/notifications/subscribe error:", e);
    return errors.server("Gagal menyimpan subscription");
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Body: { endpoint }
 * Removes a subscription. Used when the user disables push.
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json().catch(() => ({}));
    const parsed = unsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation("Endpoint diperlukan", parsed.error.flatten());
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: parsed.data.endpoint, userId: auth.id },
    });

    return ok({ ok: true });
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("DELETE /api/notifications/subscribe error:", e);
    return errors.server("Gagal menghapus subscription");
  }
}
