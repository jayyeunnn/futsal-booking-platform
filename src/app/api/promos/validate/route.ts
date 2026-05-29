import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";
import { validateDiscountCode } from "@/lib/promos";

/**
 * POST /api/promos/validate
 * Body: { code, totalAmount, hourlyRate? }
 *
 * Validates either a Promo code (e.g. JAYFIELD10) or a Redemption code
 * (e.g. JF-XXXXXX) against the current user + booking total.
 *
 * For free_session redemption rewards, caller must pass `hourlyRate` so we
 * can compute the discount amount in rupiah.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const code: string | undefined = body?.code;
    const totalAmount = Number(body?.totalAmount);
    const hourlyRate =
      body?.hourlyRate !== undefined ? Number(body.hourlyRate) : undefined;

    if (!code) {
      return errors.validation("Kode wajib diisi");
    }
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return errors.validation("totalAmount tidak valid");
    }

    const result = await validateDiscountCode({
      code,
      totalAmount,
      userId: auth.id,
      userTier: auth.tier,
      hourlyRate,
    });

    if (!result.ok) {
      return errors.validation(result.message);
    }
    return ok(result);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("POST /api/promos/validate error:", e);
    return errors.server("Gagal memvalidasi kode");
  }
}
