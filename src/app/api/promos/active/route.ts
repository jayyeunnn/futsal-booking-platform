import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/promos/active
 *
 * Public endpoint — returns currently active promo codes
 * (within startDate/endDate window, isActive=true, not exhausted).
 * Used by the public /promo page and PromoSection on landing.
 */
export async function GET() {
  try {
    const now = new Date();
    const promos = await prisma.promo.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: "desc" },
    });

    // Filter out promos whose usage_count >= usage_limit (when limit is set).
    const filtered = promos.filter(
      (p) => p.usageLimit === null || p.usageCount < p.usageLimit
    );

    return ok(filtered);
  } catch (e) {
    console.error("GET /api/promos/active error:", e);
    return errors.server("Gagal memuat promo");
  }
}
