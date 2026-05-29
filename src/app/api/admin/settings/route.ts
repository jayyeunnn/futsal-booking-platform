import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  appSettingsSchema,
  type AppSettingsInput,
} from "@/lib/validations/settings";

export const dynamic = "force-dynamic";

/**
 * Default values that get returned if a key is missing in DB.
 * Mirror values from constants.ts + PRD.
 */
const DEFAULTS: AppSettingsInput = {
  dp_percentage: 50,
  payment_deadline_minutes: 60,
  refund_policy_h1: 100,
  refund_policy_same_day_3h: 50,
  refund_policy_less_3h: 0,
  points_per_hour: 10,
  points_review: 5,
  points_referral: 20,
  points_bonus_off_peak: 5,
};

/**
 * GET /api/admin/settings
 * Returns all configurable app settings as a flat object, with defaults
 * filled in for any keys missing in DB.
 */
export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const rows = await prisma.appSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));

    // Merge with defaults: parse stored string -> number where applicable.
    const result: AppSettingsInput = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS) as Array<keyof AppSettingsInput>) {
      const raw = map.get(key);
      if (raw !== undefined) {
        const num = Number(raw);
        if (!Number.isNaN(num)) {
          result[key] = num;
        }
      }
    }

    return ok(result);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/settings error:", e);
    return errors.server("Gagal memuat settings");
  }
}

/**
 * PUT /api/admin/settings
 * Body: AppSettingsInput
 *
 * Bulk upsert all settings. Setiap key disimpan sebagai string di DB
 * (pakai upsert untuk handle missing rows).
 */
export async function PUT(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = appSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as AppSettingsInput;

    await prisma.$transaction(
      Object.entries(data).map(([key, value]) =>
        prisma.appSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return ok(data);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/settings error:", e);
    return errors.server("Gagal menyimpan settings");
  }
}
