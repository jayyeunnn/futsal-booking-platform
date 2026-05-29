import prisma from "@/lib/prisma";
import type { MemberTier } from "@/types";

/**
 * Result of validating either a Promo code or Redemption code.
 * Used by /api/promos/validate and POST /api/bookings.
 */
export type DiscountValidation =
  | {
      ok: true;
      kind: "promo";
      promoId: string;
      code: string;
      title: string;
      discountAmount: number;
      finalAmount: number;
    }
  | {
      ok: true;
      kind: "redemption";
      redemptionId: string;
      code: string;
      rewardName: string;
      /** For "discount" rewards: percentage discount applied. */
      discountPct?: number;
      /** For "free_session" rewards: hours that go free, deducted from base. */
      freeHours?: number;
      discountAmount: number;
      finalAmount: number;
    }
  | {
      ok: false;
      code: string;
      message: string;
    };

const TIER_ORDER: Record<MemberTier, number> = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
};

/**
 * Validate a promo or redemption code against the current user + booking total.
 *
 * @param input.code The user-typed code (case-insensitive)
 * @param input.totalAmount Total booking amount (after member tier discount, before promo)
 * @param input.userId Current user id for per-user limit + ownership checks
 * @param input.userTier Current user tier for member-only promo
 * @param input.hourlyRate Average hourly rate (for free_session rewards). When undefined,
 *                        free_session rewards return an error asking caller to pass it.
 */
export async function validateDiscountCode(input: {
  code: string;
  totalAmount: number;
  userId: string;
  userTier: MemberTier;
  hourlyRate?: number;
}): Promise<DiscountValidation> {
  const code = input.code.trim().toUpperCase();
  if (!code) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Kode wajib diisi" };
  }

  // Redemption codes are formatted "JF-XXXXXX". Promos are anything else.
  // Check redemption first (more specific format) so we can give clearer errors.
  if (code.startsWith("JF-")) {
    return validateRedemption(code, input);
  }
  return validatePromo(code, input);
}

async function validatePromo(
  code: string,
  ctx: {
    totalAmount: number;
    userId: string;
    userTier: MemberTier;
  }
): Promise<DiscountValidation> {
  const now = new Date();
  const promo = await prisma.promo.findFirst({
    where: {
      code,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!promo) {
    return {
      ok: false,
      code: "INVALID_PROMO",
      message: "Kode promo tidak valid atau kadaluarsa",
    };
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return {
      ok: false,
      code: "PROMO_EXHAUSTED",
      message: "Kuota promo sudah habis",
    };
  }

  if (promo.minBooking && ctx.totalAmount < Number(promo.minBooking)) {
    return {
      ok: false,
      code: "MIN_BOOKING_NOT_MET",
      message: `Minimum booking Rp ${Number(promo.minBooking).toLocaleString("id-ID")} belum terpenuhi`,
    };
  }

  if (promo.memberOnly && promo.minTier) {
    if (TIER_ORDER[ctx.userTier] < TIER_ORDER[promo.minTier]) {
      return {
        ok: false,
        code: "TIER_INSUFFICIENT",
        message: `Promo ini khusus member ${promo.minTier}+`,
      };
    }
  }

  // Per-user limit — count how many bookings dari user ini yang sudah pakai
  // promo.code di notes/promo column. Karena schema saat ini tidak track
  // promo per booking, kita pakai approximation via `notes` field. Phase 4
  // bisa improve dengan join table.
  // Untuk sekarang: skip per-user check (bisa di-enforce nanti).
  // TODO: link Booking → Promo via dedicated relation when needed.

  let discountAmount = 0;
  if (promo.discountType === "PERCENTAGE") {
    discountAmount = Math.ceil((ctx.totalAmount * Number(promo.discountValue)) / 100);
    if (promo.maxDiscount && discountAmount > Number(promo.maxDiscount)) {
      discountAmount = Number(promo.maxDiscount);
    }
  } else {
    discountAmount = Number(promo.discountValue);
  }

  // Cap discount tidak lebih dari total
  discountAmount = Math.min(discountAmount, ctx.totalAmount);

  return {
    ok: true,
    kind: "promo",
    promoId: promo.id,
    code: promo.code,
    title: promo.title,
    discountAmount,
    finalAmount: Math.max(0, ctx.totalAmount - discountAmount),
  };
}

async function validateRedemption(
  code: string,
  ctx: {
    totalAmount: number;
    userId: string;
    hourlyRate?: number;
  }
): Promise<DiscountValidation> {
  const redemption = await prisma.redemption.findUnique({
    where: { discountCode: code },
  });

  if (!redemption) {
    return {
      ok: false,
      code: "INVALID_REDEMPTION",
      message: "Kode reward tidak valid",
    };
  }

  if (redemption.userId !== ctx.userId) {
    // Don't leak ownership info — just say invalid.
    return {
      ok: false,
      code: "INVALID_REDEMPTION",
      message: "Kode reward tidak valid",
    };
  }

  if (redemption.usedAt) {
    return {
      ok: false,
      code: "REDEMPTION_USED",
      message: "Kode reward sudah pernah dipakai",
    };
  }

  if (redemption.expiresAt && redemption.expiresAt < new Date()) {
    return {
      ok: false,
      code: "REDEMPTION_EXPIRED",
      message: "Kode reward sudah kadaluarsa",
    };
  }

  // Compute discount from reward props.
  let discountAmount = 0;
  if (redemption.discountPct) {
    discountAmount = Math.ceil((ctx.totalAmount * redemption.discountPct) / 100);
  } else if (redemption.discountAmount) {
    discountAmount = redemption.discountAmount;
  } else if (redemption.freeHours) {
    if (!ctx.hourlyRate) {
      return {
        ok: false,
        code: "REWARD_REQUIRES_RATE",
        message:
          "Reward free session perlu hourly rate untuk dihitung. Silakan pilih lapangan & jadwal dulu.",
      };
    }
    discountAmount = Math.ceil(
      Number(redemption.freeHours) * ctx.hourlyRate
    );
  } else {
    return {
      ok: false,
      code: "INVALID_REDEMPTION",
      message: "Reward ini tidak bisa diaplikasikan ke booking (klaim di lokasi)",
    };
  }

  discountAmount = Math.min(discountAmount, ctx.totalAmount);

  return {
    ok: true,
    kind: "redemption",
    redemptionId: redemption.id,
    code: redemption.discountCode!,
    rewardName: redemption.rewardName,
    discountPct: redemption.discountPct ?? undefined,
    freeHours: redemption.freeHours
      ? Number(redemption.freeHours)
      : undefined,
    discountAmount,
    finalAmount: Math.max(0, ctx.totalAmount - discountAmount),
  };
}
