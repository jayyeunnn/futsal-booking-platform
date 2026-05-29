import { NextRequest } from "next/server";

/**
 * Verify a cron request is authentic.
 * Vercel Cron Jobs send `Authorization: Bearer <CRON_SECRET>` automatically
 * when CRON_SECRET is configured as an env var.
 *
 * For local dev, you can curl with:
 *   curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/...
 *
 * Returns true when authorized, false otherwise.
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured — allow only in non-production for safety.
    return process.env.NODE_ENV !== "production";
  }

  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}
