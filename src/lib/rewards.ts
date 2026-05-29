import prisma from "@/lib/prisma";
import type { MemberTier } from "@/types";
import type { Reward as DbReward, RewardType } from "@prisma/client";

/**
 * Reward catalog — sumber tunggal untuk reward store.
 *
 * Phase 3: dynamic via tabel `rewards` (lihat `prisma/schema.prisma`). Reward
 * lama hardcoded tetap dipakai sebagai fallback **sementara** kalau tabel
 * `rewards` masih kosong (mis. dev environment yang belum apply migration),
 * supaya redemption flow tidak break.
 *
 * Kunci `code` (dulu `key`) di-persist ke `Redemption.rewardKey`, jadi
 * jangan rename sembarangan setelah ada data — bikin entry baru kalau perlu.
 */

/** UI-friendly kind, derived from RewardType. */
export type RewardKind = "discount" | "free_session" | "merchandise";

/** Public reward shape — dipakai di RewardCard, redemption API, validation. */
export type Reward = {
  /** Sumber kebenaran kode — match `Redemption.rewardKey`. */
  key: string;
  kind: RewardKind;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  pointsCost: number;
  /** % discount, valid only when kind === "discount" + DISCOUNT_PERCENT. */
  discountPct?: number;
  /** Fixed-amount rupiah discount, valid only when DISCOUNT_AMOUNT. */
  discountAmount?: number;
  /** free hours, valid only when kind === "free_session". */
  freeHours?: number;
  /** Validity window after redemption, in days. */
  validForDays: number;
  /** Optional minimum tier required to redeem. */
  minTier?: MemberTier;
};

/** Map DB row → public Reward shape. */
function fromDb(row: DbReward): Reward {
  const kind: RewardKind =
    row.type === "FREE_SESSION"
      ? "free_session"
      : row.type === "MERCHANDISE"
        ? "merchandise"
        : "discount";

  const reward: Reward = {
    key: row.code,
    kind,
    name: row.name,
    nameEn: row.nameEn ?? row.name,
    description: row.description ?? "",
    descriptionEn: row.descriptionEn ?? row.description ?? "",
    pointsCost: row.pointsCost,
    validForDays: row.validForDays,
    minTier: row.minTier ?? undefined,
  };

  if (row.type === "DISCOUNT_PERCENT") reward.discountPct = row.value;
  else if (row.type === "DISCOUNT_AMOUNT") reward.discountAmount = row.value;
  else if (row.type === "FREE_SESSION") reward.freeHours = row.value;

  return reward;
}

/**
 * Hardcoded fallback list — preserved untuk kompatibilitas saat DB belum
 * di-migrate. Setelah migration apply + seed jalan, list ini tidak akan
 * pernah dipakai (tabel `rewards` selalu punya entries).
 */
const FALLBACK_REWARDS: Reward[] = [
  {
    key: "discount_10",
    kind: "discount",
    name: "Diskon 10% (1x booking)",
    nameEn: "10% discount (1x booking)",
    description: "Potongan 10% di booking berikutnya",
    descriptionEn: "10% off your next booking",
    pointsCost: 100,
    discountPct: 10,
    validForDays: 60,
  },
  {
    key: "discount_25",
    kind: "discount",
    name: "Diskon 25% (1x booking)",
    nameEn: "25% discount (1x booking)",
    description: "Potongan 25% di booking berikutnya",
    descriptionEn: "25% off your next booking",
    pointsCost: 200,
    discountPct: 25,
    validForDays: 60,
  },
  {
    key: "free_session",
    kind: "free_session",
    name: "Free 1 sesi (1 jam)",
    nameEn: "Free 1 session (1 hour)",
    description: "Free 1 jam booking lapangan reguler",
    descriptionEn: "1 hour free regular court booking",
    pointsCost: 500,
    freeHours: 1,
    validForDays: 60,
  },
  {
    key: "merchandise",
    kind: "merchandise",
    name: "Merchandise JayField",
    nameEn: "JayField Merchandise",
    description: "Tukar dengan merchandise (jersey/totebag), ambil di lokasi.",
    descriptionEn: "Redeem for merchandise (jersey/tote), pickup on-site.",
    pointsCost: 300,
    validForDays: 30,
  },
];

/**
 * Backward-compat export — synchronous static list of fallback rewards.
 * Beberapa caller (server pages) butuh akses langsung tanpa await; mereka
 * harus migrate ke `getActiveRewards()`. Kept untuk transisi.
 *
 * @deprecated Pakai `getActiveRewards()` (async, dari DB) untuk dynamic catalog.
 */
export const REWARDS: Reward[] = FALLBACK_REWARDS;

/**
 * Returns active rewards from DB, ordered by sortOrder asc → pointsCost asc.
 * Falls back to hardcoded list when tabel masih kosong (dev env tanpa migration).
 */
export async function getActiveRewards(): Promise<Reward[]> {
  try {
    const rows = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { pointsCost: "asc" }],
    });
    if (rows.length === 0) return FALLBACK_REWARDS;
    return rows.map(fromDb);
  } catch (e) {
    // Table mungkin belum ada (migration belum apply). Fallback supaya
    // existing flow tetap jalan di local dev.
    console.warn(
      "[rewards] getActiveRewards: DB query failed, using hardcoded fallback.",
      e instanceof Error ? e.message : e
    );
    return FALLBACK_REWARDS;
  }
}

/**
 * Lookup a reward by its `key` / `code`.
 * Cek DB dulu, fallback ke hardcoded list kalau tidak ada (atau DB unreachable).
 */
export async function getReward(key: string): Promise<Reward | undefined> {
  try {
    const row = await prisma.reward.findUnique({ where: { code: key } });
    if (row) return fromDb(row);
  } catch (e) {
    console.warn(
      "[rewards] getReward: DB query failed, falling back.",
      e instanceof Error ? e.message : e
    );
  }
  return FALLBACK_REWARDS.find((r) => r.key === key);
}

/**
 * Member discount default per tier — auto-applied at booking time.
 *   Bronze 0%, Silver 10%, Gold 20%
 * (Sumber: PRD §3.4.2.)
 */
export function getMemberDiscountPct(tier: MemberTier): number {
  switch (tier) {
    case "GOLD":
      return 20;
    case "SILVER":
      return 10;
    default:
      return 0;
  }
}

/** Generate a short, readable redemption code, e.g. "JF-A1B2C3". */
export function generateRedemptionCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // omit O/0/I/1 ambiguity
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `JF-${s}`;
}

/** Re-export Prisma RewardType for use across admin components. */
export type { RewardType };
